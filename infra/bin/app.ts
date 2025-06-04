#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LinebotStack } from '../lib/linebot-stack';

const app = new cdk.App();
new LinebotStack(app, 'LinebotStack');
