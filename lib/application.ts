import * as commander from 'commander';
import * as process from 'process';
import * as childProc from 'child_process';

// https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sourcing-external.html

interface AwsStsAssumeRoleResult {
  Credentials: {
    AccessKeyId: string;
    SecretAccessKey: string;
    SessionToken: string;
    Expiration: string;
  }
}

interface AwsCredential {
  Version: number;
  AccessKeyId: string;
  SecretAccessKey: string;
  SessionToken: string;
  Expiration: string;
}

export class Application {
  async run(): Promise<void> {
    const program = new commander.Command();
    program.requiredOption('--role-arn <role-arn>', 'The AWS IAM role ARN');
    program.requiredOption('--role-session-name <role-session-name>', 'The temporary credential name');
    program.option('--region <region>', 'The AWS region (default: us-east-1');
    program.option('--profile <profile>', 'The AWS credential profile name');

    program.parse(process.argv);

    const roleArn = program.roleArn;
    const roleSessionName = program.roleSessionName;
    const region = program.region;
    const profile = program.profile;

    const assumeRoleCommand: string[] = ['aws'];
    if (region !== undefined) {
      assumeRoleCommand.push('--region', region);
    }
    if (profile !== undefined) {
      assumeRoleCommand.push('--profile', profile);
    }
    assumeRoleCommand.push('sts', 'assume-role', '--role-arn', roleArn, '--role-session-name', roleSessionName);
    const payload = JSON.parse(childProc.execSync(assumeRoleCommand.join(' ')).toString()) as AwsStsAssumeRoleResult;

    const credential: AwsCredential = {
      Version: 1,
      AccessKeyId: payload.Credentials.AccessKeyId,
      SecretAccessKey: payload.Credentials.SecretAccessKey,
      SessionToken: payload.Credentials.SessionToken,
      Expiration: payload.Credentials.Expiration,
    };

    process.stdout.write(JSON.stringify(credential));
    process.stdout.write('\n');
  }
}
