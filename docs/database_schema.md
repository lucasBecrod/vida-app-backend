#### Entity: Users
- **Description**: Represents user accounts in the system.
- **Attributes**:
  - `id`: bigint (PK, auto-generated)
  - `username`: text (UK, not null)
  - `password_hash`: text (not null)
  - `email`: text (UK, not null)
  - `created_at`: timestamp with time zone (default: now())
  - `updated_at`: timestamp with time zone (default: now())
- **Constraints**: Primary key on `id`; unique on `username` and `email`.

#### Entity: Patients
- **Description**: Stores patient profiles linked to users.
- **Attributes**:
  - `id`: bigint (PK, auto-generated)
  - `user_id`: bigint (FK to Users.id, not null)
  - `first_name`: text (not null)
  - `last_name`: text (not null)
  - `age`: int (not null)
  - `gender`: text (not null)
  - `weight`: float (not null)
  - `height`: float (not null)
  - `created_at`: timestamp with time zone (default: now())
  - `updated_at`: timestamp with time zone (default: now())
- **Constraints**: Primary key on `id`.

#### Entity: Appointments
- **Description**: Records patient appointments.
- **Attributes**:
  - `id`: bigint (PK, auto-generated)
  - `patient_id`: bigint (FK to Patients.id, not null)
  - `appointment_date`: timestamp with time zone (not null)
  - `doctor_name`: text (not null)
  - `doctor_specialty`: text (not null)
  - `conclusions`: text (not null)
  - `purpose`: text
  - `embedding_id`: bigint (FK to meta.Embeddings.id, not null)
  - `created_at`: timestamp with time zone (default: now())
  - `updated_at`: timestamp with time zone (default: now())
- **Constraints**: Primary key on `id`.

#### Entity: Medical Documents
- **Description**: Stores information of medical documents.
- **Attributes**:
  - `id`: bigint (PK, auto-generated)
  - `patient_id`: bigint (FK to Patients.id, not null)
  - `document_name`: text (not null)
  - `summary`: text
  - `test_document`: date (not null)
  - `embedding_id`: bigint (FK to meta.Embeddings.id, not null)
  - `created_at`: timestamp with time zone (default: now())
  - `updated_at`: timestamp with time zone (default: now())
- **Constraints**: Primary key on `id`.

#### Entity: Access Permissions
- **Description**: Manages access permissions for family members to patient data.
- **Attributes**:
  - `id`: bigint (PK, auto-generated)
  - `patient_id`: bigint (FK to Patients.id, not null)
  - `family_member_id`: bigint (FK to Users.id, not null)
  - `access_granted`: boolean (default: false)
  - `invitation_sent_at`: timestamp with time zone
  - `access_granted_at`: timestamp with time zone
- **Constraints**: Primary key on `id`.

#### Entity: Conversations
- **Description**: Tracks user conversations, possibly for chat or support features.
- **Attributes**:
  - `id`: bigint (PK, auto-generated)
  - `user_id`: bigint (FK to Users.id, not null)
  - `last_messages`: text
  - `created_at`: timestamp with time zone (default: now())
  - `updated_at`: timestamp with time zone (default: now())
- **Constraints**: Primary key on `id`.

#### Entity: Conversation Summaries
- **Description**: Stores summaries of conversations, linked to embeddings for searchability.
- **Attributes**:
  - `id`: bigint (PK, auto-generated)
  - `conversation_id`: bigint (FK to Conversations.id, not null)
  - `summary_text`: text (not null)
  - `embedding_id`: bigint (FK to meta.Embeddings.id, not null)
  - `created_at`: timestamp with time zone (default: now())
- **Constraints**: Primary key on `id`.

### Relationships

- **Users to Patients**: One-to-Many (1:N). A User can be associated with multiple Patients (via `user_id`), but each Patient is linked to one User. This represents users managing patient profiles (e.g., their own or family).
- **Patients to Appointments**: One-to-Many (1:N). A Patient can have multiple Appointments (via `patient_id`), but each Appointment belongs to one Patient.
- **Patients to Medical Documents**: One-to-Many (1:N). A Patient can have multiple Medical Documents (via `patient_id`), but each Medical Document belongs to one Patient.
- **Patients to Access Permissions**: One-to-Many (1:N). A Patient can grant access to multiple family members (via `patient_id`), but each Access Permission is for one Patient.
- **Users to Access Permissions**: One-to-Many (1:N). A User (as family member) can have access permissions for multiple Patients (via `family_member_id`), but each Access Permission is for one family member User.
- **Users to Conversations**: One-to-Many (1:N). A User can have multiple Conversations (via `user_id`), but each Conversation belongs to one User.
- **Conversations to Conversation Summaries**: One-to-Many (1:N). A Conversation can have multiple Summaries (via `conversation_id`), but each Summary belongs to one Conversation.