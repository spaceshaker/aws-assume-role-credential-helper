# AWS Assume Role Credential Helper

## What is this?

This is a command-line tool that serves as an adapter between the AWS `credential_process` interface (see [AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sourcing-external.html)) in `~/.aws/config` and a call to `aws sts assume-role`. The `credential_process` system in the AWS CLI does not natively work with the output of `aws sts assume-role` and thus must be slightly adapted to work.

## Why is this useful?

Firstly, the AWS CLI already supports assuming a role via the `assume_role` attribute. You should use that instead of this if you can.

This tool is only useful if you are using SSO as a root of authentication. At the moment, many of the AWS SDKs do not support assuming a role when the parent profile is using SSO. The AWS CLI does however support this so the usefulness of this tool is that bridges the gap left by lack of support for SSO based logins in the various AWS SDKs.

## How to use this tool?

### Step #1 - Installation

```bash
npm install aws-assume-role-credential-helper
```

### Step #2 - Configuration

The following is an example configuration. You will very likely need to adapt this configuration to your needs.

```text
[profile sso-root]
sso_start_url = https://myorg.awsapps.com/start
sso_region = us-east-1
sso_account_id = 123456789012
sso_role_name = MyIAMRole
region = us-east-1
output = json

[profile childprofile]
region = us-east-1
output = json
credential_process = aws-assume-role-credential-helper --profile sso-root --role-arn arn:aws:iam::123456789012:role/MySSORole --role-session-name logmein
```

In this example the `childprofile` profile will use the credential process tool to acquire AWS credentials. We've configured the `credential_process` attribute to use our tool to perform an `aws sts assume-role` and using the `sso-root` profile which is a standalone SSO profile.

This tool is even more powerful when used in a 3-level manner. Considering the following configuration.

```text
[profile sso-root]
sso_start_url = https://myorg.awsapps.com/start
sso_region = us-east-1
sso_account_id = 123456789012
sso_role_name = MyIAMRole
region = us-east-1
output = json

[profile main]
region = us-east-1
output = json
credential_process = aws-assume-role-credential-helper --profile sso-root --role-arn arn:aws:iam::123456789012:role/MySSORole --role-session-name logmein

[profile custom]
role_arn = arn:aws:iam::123456789012:role/MyCustomRole
source_profile = main
region = us-east-1
output = json
```

In this example `custom` uses the built-in support for role assumption using credentials sourced from `main`. The `main` profile then delegates (through an external credential process) to our SSO root profile named `sso-root`.
