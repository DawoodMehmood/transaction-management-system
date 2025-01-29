ALTER TABLE tkg.tasks
ADD COLUMN is_repeatable boolean NOT NULL DEFAULT false,
ADD COLUMN frequency int NULL,
ADD COLUMN interval int NULL,
ADD COLUMN interval_type text NULL;

ALTER TABLE tkg.transaction_detail
ADD COLUMN task_days int4 NULL;