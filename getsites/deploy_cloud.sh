#!/usr/bin/env bash
#!/usr/bin/env bash
gcloud beta functions deploy getSites \
--trigger-topic=get_sites \
--stage-bucket=get-sites