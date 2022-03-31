

// Event rule for weekly sync
// Frequency: weekly SUN  0:15 AM PST
resource "aws_cloudwatch_event_rule" "export_submissions_cron_weekly" {
  name                = local.pir_sync_cron_weekly_name
  description         = "Fires once a week"
  schedule_expression = "cron(15 4 ? * 1 *)"
}


// Setting up daily event target
resource "aws_cloudwatch_event_target" "export_submissions_cron_weekly" {
  rule      = aws_cloudwatch_event_rule.pir_sync_cron_weekly.name
  target_id = "lambda"
  arn       = aws_lambda_function.background_task.arn
  input     = <<JSON
  {
    "detail" : {
      "type": "cron",
      "task": "weekly-export"
    }
  }
  JSON
}

// Weekly invocation
resource "aws_lambda_permission" "cloudwatch_lambda_weekly_sync_invoke" {
  statement_id  = "AllowExecutionFromCloudWatchWeekly"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.background_task.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.export_submissions_cron_weekly.arn
}


