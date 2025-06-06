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
      maxAzs: Math.min(2, this.availabilityZones.length)
    });

    const cluster = new ecs.Cluster(this, 'Cluster', { vpc, defaultCloudMapNamespace: { name: 'agent-squad' } });

    const db = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16_3 }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      publiclyAccessible: false,
    });

    const dbUrl = `postgresql://${db.secret!.secretValueFromJson('username')}:${db.secret!.secretValueFromJson('password')}@${db.dbInstanceEndpointAddress}:${db.dbInstanceEndpointPort}/postgres`;

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
      environment: {
        AGENT_SQUAD_API_URL: `http://agent-squad.agent-squad:8000`,
        DATABASE_URL: dbUrl,
      },
      secrets: {
        LINE_CHANNEL_SECRET: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'LineSecret', 'LINE_CHANNEL_SECRET')),
        LINE_CHANNEL_ACCESS_TOKEN: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'LineToken', 'LINE_CHANNEL_ACCESS_TOKEN')),
        OPENAI_API_KEY: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'OpenAI', 'OPENAI_API_KEY')),
        GEMINI_API_KEY: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'Gemini', 'GEMINI_API_KEY')),
        GROK_API_KEY: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'Grok', 'GROK_API_KEY')),
        GROQ_API_KEY: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'Groq', 'GROQ_API_KEY')),
        ADMIN_LINE_USER_ID: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'AdminUser', 'ADMIN_LINE_USER_ID')),
      },
    });

    const linebotService = new ecsp.ApplicationLoadBalancedFargateService(this, 'LinebotService', {
      cluster,
      taskDefinition: linebotTask,
      assignPublicIp: true,
      publicLoadBalancer: true,
    });

    const agentTask = new ecs.FargateTaskDefinition(this, 'AgentTask', { taskRole });
    agentTask.addContainer('AgentContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(image),
      logging: ecs.LogDriver.awsLogs({ streamPrefix: 'agent-squad' }),
      portMappings: [{ containerPort: 8000 }],
      environment: { DATABASE_URL: dbUrl },
      secrets: {
        OPENAI_API_KEY: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'OpenAI2', 'OPENAI_API_KEY')),
        GEMINI_API_KEY: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'Gemini2', 'GEMINI_API_KEY')),
        GROK_API_KEY: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'Grok2', 'GROK_API_KEY')),
        GROQ_API_KEY: ecs.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, 'Groq2', 'GROQ_API_KEY')),
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
