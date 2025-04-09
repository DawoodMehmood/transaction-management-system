-- Initial database changes
ALTER TABLE tkg.tasks
ADD COLUMN is_repeatable boolean NOT NULL DEFAULT false,
ADD COLUMN frequency int NULL,
ADD COLUMN interval int NULL,
ADD COLUMN interval_type text NULL;

ALTER TABLE tkg.transaction_detail
ADD COLUMN task_days int4 NULL;

-- Database changes for catering multiple states and transaction type
-- transaction table
ALTER TABLE tkg."transaction"
ADD COLUMN transaction_type varchar(20) NOT NULL DEFAULT 'listing';

-- stages table
ALTER TABLE tkg.stages
ADD COLUMN transaction_type varchar(20) NOT NULL DEFAULT 'listing';

ALTER TABLE tkg.stages
DROP CONSTRAINT stages_pkey;

ALTER TABLE tkg.stages ADD CONSTRAINT stages_pkey PRIMARY KEY (state_id, transaction_type, stage_id);

-- dates table
ALTER TABLE tkg.dates
ADD COLUMN transaction_type varchar(20) NOT NULL DEFAULT 'listing';

-- Drop the existing unique constraints (if they exist)
ALTER TABLE tkg.dates
DROP CONSTRAINT IF EXISTS unique_state_date_name_transaction;

ALTER TABLE tkg.dates
DROP CONSTRAINT IF EXISTS unique_state_date_name_transaction_stage;

-- Add a new unique constraint including transaction_type
ALTER TABLE tkg.dates ADD CONSTRAINT unique_state_date_name_transaction UNIQUE (
    state_id,
    transaction_type,
    date_name,
    transaction_id,
    stage_id
);

ALTER TABLE tkg.dates
DROP CONSTRAINT fk_formdates;

-- formdates table
ALTER TABLE tkg.formdates
ADD COLUMN transaction_type varchar(20) NOT NULL DEFAULT 'listing';

ALTER TABLE tkg.formdates
DROP CONSTRAINT formdates_date_id_key;

ALTER TABLE tkg.formdates
DROP CONSTRAINT formdates_pkey;

ALTER TABLE tkg.formdates ADD CONSTRAINT formdates_pkey PRIMARY KEY (state_id, transaction_type, date_id);

ALTER TABLE tkg.dates ADD CONSTRAINT fk_formdates FOREIGN KEY (state_id, transaction_type, date_id) REFERENCES tkg.formdates (state_id, transaction_type, date_id) ON DELETE CASCADE;

-- tasks table
ALTER TABLE tkg.transaction_detail
DROP CONSTRAINT transaction_detail_state_id_stage_id_task_id_fkey;

ALTER TABLE tkg.tasks
ADD COLUMN transaction_type varchar(20) NOT NULL DEFAULT 'listing';

ALTER TABLE tkg.tasks
DROP CONSTRAINT tasks_pkey;

ALTER TABLE tkg.tasks ADD CONSTRAINT tasks_pkey PRIMARY KEY (state, transaction_type, stage_id, task_id);

ALTER TABLE tkg.tasks
ALTER COLUMN task_name TYPE text;

-- transaction_detail table
ALTER TABLE tkg.transaction_detail
ADD COLUMN transaction_type varchar(20) NOT NULL DEFAULT 'listing';

-- Add a new foreign key that includes transaction_type
-- ALTER TABLE tkg.transaction_detail ADD CONSTRAINT transaction_detail_state_id_stage_id_task_id_fkey FOREIGN KEY (state_id, transaction_type, stage_id, task_id) REFERENCES tkg.tasks (state, transaction_type, stage_id, task_id) ON DELETE CASCADE;
ALTER TABLE tkg.transaction_detail
DROP COLUMN list_price,
DROP COLUMN sale_price,
DROP COLUMN transaction_date;

ALTER TABLE tkg.tasks
ALTER COLUMN task_name TYPE text;

-- users table
-- Add the role column with a default value of 'admin'
ALTER TABLE tkg.users
ADD COLUMN role varchar(20) NOT NULL DEFAULT 'admin';

-- Optionally, add a check constraint so that role can only be 'admin' or 'superadmin'
ALTER TABLE tkg.users ADD CONSTRAINT role_check CHECK (role IN ('admin', 'superadmin'));

UPDATE tkg.users
SET
    role = 'superadmin'
WHERE
    email = 'test@example.com';

insert into
    tkg.formdates (
        state_id,
        date_id,
        date_name,
        created_date,
        created_by,
        transaction_type
    )
Values
    (
        'CO',
        1,
        'Appointment Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'CO',
        2,
        'Listing Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'CO',
        3,
        'Contract Signed Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'CO',
        4,
        'Home Inspection Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'CO',
        5,
        'Appraisal Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'CO',
        6,
        'Closing Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'CO',
        7,
        'Expiration Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'NV',
        1,
        'Appointment Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'NV',
        2,
        'Listing Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'NV',
        3,
        'Contract Signed Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'NV',
        4,
        'Home Inspection Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'NV',
        5,
        'Appraisal Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'NV',
        6,
        'Closing Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'NV',
        7,
        'Expiration Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'CO',
        1,
        'Buyer Signed Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'CO',
        3,
        'Under Contract Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'CO',
        4,
        'Home Inspection Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'CO',
        5,
        'Appraisal Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'CO',
        2,
        'Closing Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'NV',
        1,
        'Buyer Signed Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'NV',
        3,
        'Under Contract Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'NV',
        4,
        'Home Inspection Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'NV',
        5,
        'Appraisal Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'NV',
        2,
        'Closing Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'IL',
        1,
        'Buyer Signed Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'IL',
        3,
        'Under Contract Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'IL',
        4,
        'Home Inspection Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'IL',
        5,
        'Appraisal Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'IL',
        2,
        'Closing Date',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    );

insert into
    tkg.stages (
        state_id,
        stage_id,
        stage_name,
        created_date,
        created_by,
        transaction_type
    )
Values
    (
        'CO',
        1,
        'Active Buyer',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'CO',
        2,
        'Under Contract',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'NV',
        1,
        'Active Buyer',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'NV',
        2,
        'Under Contract',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'IL',
        1,
        'Active Buyer',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'IL',
        2,
        'Under Contract',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'buyer'
    ),
    (
        'CO',
        1,
        'Pre-Listing',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'CO',
        2,
        'Active Listing',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'CO',
        3,
        'Under Contract',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'NV',
        1,
        'Pre-Listing',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'NV',
        2,
        'Active Listing',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    ),
    (
        'NV',
        3,
        'Under Contract',
        '2025-03-30 22:02:46.46587',
        'Dawood',
        'listing'
    );