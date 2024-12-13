resource "aws_lambda_function" "api" {
  description      = "API for ${local.namespace}"
  function_name    = local.api_name
  role             = aws_iam_role.lambda.arn
  runtime          = "nodejs18.x"
  filename         = var.api_artifact
  source_code_hash = filebase64sha256(var.api_artifact)
  handler          = "api/lambda.handler"
  memory_size      = var.function_memory_mb
  timeout          = 30

  vpc_config {
    security_group_ids = [data.aws_security_group.app.id]
    subnet_ids         = data.aws_subnets.app.ids
  }

  lifecycle {
    ignore_changes = [
      # Ignore changes to tags, e.g. because a management agent
      # updates these based on some ruleset managed elsewhere.
      filename,
      source_code_hash,
      source_code_size,
      last_modified,
    ]
  }
  environment {
    variables = {
      TARGET_ENV                 = var.target_env
      NODE_ENV                   = "production"
      AWS_S3_REGION              = var.region
      RUNTIME_ENV                = "hosted"
      POSTGRES_HOST              = aws_rds_cluster.pgsql.endpoint
      POSTGRES_DATABASE          = aws_rds_cluster.pgsql.database_name
      POSTGRES_PASSWORD          = data.aws_ssm_parameter.postgres_password.value
      POSTGRES_USERNAME          = var.db_username
      MAIL_FROM                  = var.mail_from
      DOMAIN                     = var.domain
      BUILD_ID                   = var.build_id
      BUILD_INFO                 = var.build_info
      SLACK_ALERTS_WEBHOOK_URL   = data.aws_ssm_parameter.slack_alerts_webhook_url.value
      ENABLE_UPDATE_CONFIRMATION = data.aws_ssm_parameter.enable_update_confirmation.value
      KC_URL                     = data.aws_ssm_parameter.keycloak_auth_url.value
      KC_REALM                   = data.aws_ssm_parameter.keycloak_realm.value
      KC_CLIENT_ID               = data.aws_ssm_parameter.keycloak_client_id.value
      JWT_SECRET                 = data.aws_ssm_parameter.jwt_secret.value
      FEATURE_MASS_EMAIL         = var.feature_mass_email
    }
  }
}

resource "aws_apigatewayv2_api" "api" {
  name          = local.api_name
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "api" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  connection_type    = "INTERNET"
  description        = local.api_name
  integration_method = "POST"
  integration_uri    = aws_lambda_function.api.invoke_arn
}

resource "aws_apigatewayv2_route" "api" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}

locals {
  api_gateway_log_format_with_newlines = <<EOF
{ 
"requestId":"$context.requestId",
"ip":"$context.identity.sourceIp",
"requestTime":"$context.requestTime",
"httpMethod":"$context.httpMethod",
"status":"$context.status",
"path":"$context.path",
"responseLength":"$context.responseLength",
"errorMessage":"$context.error.message"
}
EOF
  api_gateway_log_format               = replace(local.api_gateway_log_format_with_newlines, "\n", "")
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name = "api-gw/${local.api_name}/logs"

  lifecycle {
    ignore_changes = [
      retention_in_days
    ]
  }
}

resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format          = local.api_gateway_log_format
  }
}

resource "aws_lambda_permission" "api_allow_gateway" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_stage.api.execution_arn}/*"
}

## rate-limit

# Step 2: Create the API Gateway Stage
resource "aws_apigatewayv2_stage" "submission_stage" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "submission"
  auto_deploy = true
}

# Step 3: Create the POST Route
resource "aws_apigatewayv2_route" "submission_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /api/v1/submission"
}

# Step 5: Attach the Integration to the Route
resource "aws_apigatewayv2_route_response" "submission_route_response" {
  api_id   = aws_apigatewayv2_api.api.id
  route_id = aws_apigatewayv2_route.submission_route.id

  # Set route_response_key to "200" for success
  route_response_key = "200"
}

# Step 6: Configure Throttling and Rate Limits
resource "aws_apigatewayv2_stage_settings" "rate_limits" {
  api_id     = aws_apigatewayv2_api.api.id
  stage_name = aws_apigatewayv2_stage.submission_stage.name

  # Throttle limits
  throttle_settings {
    burst_limit = 1   # Allow only 1 burst request
    rate_limit  = 0.2 # 1 request every 5 minutes (300 seconds)
  }
}
