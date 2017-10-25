#!/usr/bin/env bash
gcloud beta functions deploy cronFuncCall --stage-bucket cron-execute --trigger-topic cron_execute