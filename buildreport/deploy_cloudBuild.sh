#!/usr/bin/env bash
gcloud beta functions deploy updateDb --stage-bucket build-report --trigger-topic build_report --timeout=360