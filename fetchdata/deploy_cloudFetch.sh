#!/usr/bin/env bash
#!/usr/bin/env bash
#!/usr/bin/env bash
gcloud beta functions deploy getSiteData \
--trigger-topic=fetch_data \
--stage-bucket=fetch-data