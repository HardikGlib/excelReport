#!/usr/bin/env bash
gcloud beta functions deploy sendReport --stage-bucket send-report --trigger-topic send_report
