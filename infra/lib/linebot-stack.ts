import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class LinebotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', { 
      availabilityZones: ['ap-northeast-1a', 'ap-northeast-1c'],
      natGateways: 1
    });

    const cluster = new ecs.Cluster(this, 'Cluster', { vpc, defaultCloudMapNamespace: { name: 'agent-squad' } });

    const db = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16_3 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      publiclyAccessible: false,
      allocatedStorage: 20,
      deletionProtection: false,
    });

    const dbUrl = `postgresql://${db.secret!.secretValueFromJson('username')}:${db.secret!.secretValueFromJson('password')}@${db.dbInstanceEndpointAddress}:${db.dbInstanceEndpointPort}/postgres`;

    // Create secrets for application
    const lineChannelSecret = new secretsmanager.Secret(this, 'LineChannelSecret', {
      secretName: 'LINE_CHANNEL_SECRET',
      description: 'LINE Bot Channel Secret'
    });

    const lineChannelAccessToken = new secretsmanager.Secret(this, 'LineChannelAccessToken', {
      secretName: 'LINE_CHANNEL_ACCESS_TOKEN',
      description: 'LINE Bot Channel Access Token'
    });

    const openaiApiKey = new secretsmanager.Secret(this, 'OpenaiApiKey', {
      secretName: 'OPENAI_API_KEY',
      description: 'OpenAI API Key'
    });

    const geminiApiKey = new secretsmanager.Secret(this, 'GeminiApiKey', {
      secretName: 'GEMINI_API_KEY',
      description: 'Gemini API Key'
    });

    const grokApiKey = new secretsmanager.Secret(this, 'GrokApiKey', {
      secretName: 'GROK_API_KEY',
      description: 'Grok API Key'
    });

    const groqApiKey = new secretsmanager.Secret(this, 'GroqApiKey', {
      secretName: 'GROQ_API_KEY',
      description: 'Groq API Key'
    });

    const adminLineUserId = new secretsmanager.Secret(this, 'AdminLineUserId', {
      secretName: 'ADMIN_LINE_USER_ID',
      description: 'Admin LINE User ID'
    });

    const image = new ecrAssets.DockerImageAsset(this, 'ServiceImage', {
      directory: '../',
      file: 'Dockerfile',
      exclude: [
        'infra/cdk.out',
        'infra/node_modules',
        '**/.git',
        '**/node_modules',
        '**/dist',
        '**/coverage',
        '**/*.log'
      ],
    });

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    const linebotTask = new ecs.FargateTaskDefinition(this, 'LinebotTask', { taskRole });
    linebotTask.addContainer('LinebotContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(image),
      logging: ecs.LogDriver.awsLogs({ streamPrefix: 'linebot' }),
      portMappings: [{ containerPort: 3000 }],
      command: ['npm', 'run', 'dev', '--prefix', 'backend/linebot'],
      environment: {
        AGENT_SQUAD_API_URL: `http://agent-squad.agent-squad:8000`,
        DATABASE_URL: dbUrl,
      },
      secrets: {
        LINE_CHANNEL_SECRET: ecs.Secret.fromSecretsManager(lineChannelSecret),
        LINE_CHANNEL_ACCESS_TOKEN: ecs.Secret.fromSecretsManager(lineChannelAccessToken),
        OPENAI_API_KEY: ecs.Secret.fromSecretsManager(openaiApiKey),
        GEMINI_API_KEY: ecs.Secret.fromSecretsManager(geminiApiKey),
        GROK_API_KEY: ecs.Secret.fromSecretsManager(grokApiKey),
        GROQ_API_KEY: ecs.Secret.fromSecretsManager(groqApiKey),
        ADMIN_LINE_USER_ID: ecs.Secret.fromSecretsManager(adminLineUserId),
      },
    });

    const linebotService = new ecsp.ApplicationLoadBalancedFargateService(this, 'LinebotService', {
      cluster,
      taskDefinition: linebotTask,
      assignPublicIp: true,
      publicLoadBalancer: true,
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    // ヘルスチェックパスを /health に変更
    linebotService.targetGroup.configureHealthCheck({
      path: '/health',
      healthyHttpCodes: '200',
    });

    const agentTask = new ecs.FargateTaskDefinition(this, 'AgentTask', { taskRole });
    agentTask.addContainer('AgentContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(image),
      logging: ecs.LogDriver.awsLogs({ streamPrefix: 'agent-squad' }),
      portMappings: [{ containerPort: 8000 }],
      command: ['npm', 'run', 'dev', '--prefix', 'backend/agent-squad'],
      environment: { DATABASE_URL: dbUrl },
      secrets: {
        OPENAI_API_KEY: ecs.Secret.fromSecretsManager(openaiApiKey),
        GEMINI_API_KEY: ecs.Secret.fromSecretsManager(geminiApiKey),
        GROK_API_KEY: ecs.Secret.fromSecretsManager(grokApiKey),
        GROQ_API_KEY: ecs.Secret.fromSecretsManager(groqApiKey),
      },
    });

    const agentService = new ecs.FargateService(this, 'AgentService', {
      cluster,
      taskDefinition: agentTask,
      cloudMapOptions: { name: 'agent-squad' },
      assignPublicIp: false,
    });

    agentService.connections.allowFrom(linebotService.service, ec2.Port.tcp(8000));
    db.connections.allowDefaultPortFrom(agentService);
  }
}
