# Backups

- backup.yml runs every day at 02:00 UTC. It dumps the database, encrypts it, uploads it to the Google Drive folder, and keeps the newest 30.
- restore-test.yml runs every Sunday at 03:00 UTC. It restores the newest backup into a scratch database and checks that data is present.

The backup covers the database, login accounts (auth schema) and storage records. It does not include the private files themselves (research PDFs, covers, avatars, CVs), which need a separate step.
