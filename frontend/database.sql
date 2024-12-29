-- Step 1: Create the schema
CREATE SCHEMA tkg;

-- Step 2: Create tables without foreign keys

-- tkg.state table (no dependencies)
CREATE TABLE tkg.state (
    state varchar(2) NOT NULL,
    state_name varchar(50) NOT NULL,
    created_date timestamp NOT NULL,
    created_by varchar(50) NOT NULL,
    updated_date timestamp NULL,
    updated_by varchar(50) NULL,
    CONSTRAINT state_pkey PRIMARY KEY (state)
);

-- tkg.formdates table (depends on tkg.state)
CREATE TABLE tkg.formdates (
    state_id varchar(2) NOT NULL,
    date_id serial4 NOT NULL,
    date_name varchar(50) NOT NULL,
    created_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(50) NOT NULL,
    updated_date timestamp NULL,
    updated_by varchar(50) NULL,
    CONSTRAINT formdates_date_id_key UNIQUE (date_id),
    CONSTRAINT formdates_pkey PRIMARY KEY (state_id, date_id)
);

-- tkg.stages table (depends on tkg.state)
CREATE TABLE tkg.stages (
    state_id varchar(2) NOT NULL,
    stage_id serial4 NOT NULL,
    stage_name varchar(50) NOT NULL,
    created_date timestamp NOT NULL,
    created_by varchar(50) NOT NULL,
    updated_date timestamp NULL,
    updated_by varchar(50) NULL,
    CONSTRAINT stages_pkey PRIMARY KEY (state_id, stage_id)
);

-- tkg.tasks table (depends on tkg.state, tkg.stages, tkg.formdates)
CREATE TABLE tkg.tasks (
    state varchar(2) NOT NULL,
    stage_id int4 NOT NULL,
    task_id serial4 NOT NULL,
    task_name varchar(200) NOT NULL,
    task_days int4 NOT NULL,
    date_id int4 NOT NULL,
    created_date timestamp NOT NULL,
    created_by varchar(50) NOT NULL,
    updated_date timestamp NULL,
    updated_by varchar(50) NULL,
    CONSTRAINT tasks_pkey PRIMARY KEY (state, stage_id, task_id)
);

-- tkg.transaction table (no dependencies)
CREATE TABLE tkg."transaction" (
    transaction_id bigserial NOT NULL,
    first_name varchar(50) NULL,
    last_name varchar(50) NULL,
    address1 varchar(50) NULL,
    address2 varchar(50) NULL,
    city varchar(50) NULL,
    state varchar(2) NULL,
    list_price numeric(13, 2) NULL,
    stage_id numeric(2) NULL,
    zip varchar(10) NULL,
    delete_ind bool NULL,
    created_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(50) NOT NULL,
    updated_date timestamp NULL,
    updated_by varchar(50) NULL,
    CONSTRAINT transaction_pkey PRIMARY KEY (transaction_id)
);

-- tkg.dates table (depends on tkg.formdates, tkg.transaction)
CREATE TABLE tkg.dates (
    state_id varchar(2) NOT NULL,
    date_name varchar(50) NOT NULL,
    created_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(50) NOT NULL,
    updated_date timestamp NULL,
    updated_by varchar(50) NULL,
    transaction_id int8 NULL,
    stage_id int4 NULL,
    entered_date date NULL,
    date_id int4 NOT NULL,
    CONSTRAINT unique_state_date_name_transaction UNIQUE (state_id, date_name, transaction_id, stage_id),
    CONSTRAINT unique_state_date_name_transaction_stage UNIQUE (state_id, date_name, transaction_id, stage_id)
);

-- tkg.transaction_detail table (depends on tkg.tasks, tkg.transaction)
CREATE TABLE tkg.transaction_detail (
    transaction_id int8 NOT NULL,
    transaction_detail_id numeric(4) NOT NULL,
    list_price numeric(13, 2) NULL,
    sale_price numeric(13, 2) NULL,
    state_id varchar(2) NOT NULL,
    date_id int4 NULL,
    transaction_date date NULL,
    stage_id int4 NULL,
    task_id int4 NULL,
    task_name varchar(200) NULL,
    task_status varchar(20) NULL,
    delete_ind bool NULL,
    created_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(50) NOT NULL,
    updated_date timestamp NULL,
    updated_by varchar(50) NULL,
    is_skipped BOOLEAN DEFAULT FALSE, -- Track if the task is skipped
    skip_reason TEXT NULL, -- Reason for skipping
    skipped_by VARCHAR(50) NULL, -- User who skipped the task
    skipped_date TIMESTAMP NULL, -- When the task was skipped
    task_due_date date NULL, -- When the task is due
    notes TEXT NULL; -- Note associated with the task
    CONSTRAINT transaction_detail_pkey PRIMARY KEY (transaction_id, transaction_detail_id)
);

ALTER TABLE tkg.transaction_detail


-- tkg.users table (no dependencies)
CREATE TABLE tkg.users (
    user_id serial4 NOT NULL,
    username varchar(50) NOT NULL,
    email varchar(100) NOT NULL,
    "password" varchar(255) NOT NULL,
    created_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date timestamp NULL,
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_username_key UNIQUE (username)
);

-- Step 3: Add foreign key constraints

-- tkg.dates foreign keys
ALTER TABLE tkg.dates
ADD CONSTRAINT fk_formdates FOREIGN KEY (date_id) REFERENCES tkg.formdates (date_id) ON DELETE CASCADE;

ALTER TABLE tkg.dates
ADD CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES tkg."transaction" (transaction_id);

-- tkg.transaction_detail foreign keys
ALTER TABLE tkg.transaction_detail
ADD CONSTRAINT transaction_detail_state_id_stage_id_task_id_fkey FOREIGN KEY (state_id, stage_id, task_id) REFERENCES tkg.tasks (state, stage_id, task_id) ON DELETE CASCADE;

ALTER TABLE tkg.transaction_detail
ADD CONSTRAINT transaction_detail_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES tkg."transaction" (transaction_id) ON DELETE CASCADE;
