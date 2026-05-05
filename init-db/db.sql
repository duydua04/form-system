--
-- PostgreSQL database dump (Cleaned for Docker Init)
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -;
--
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

--
-- Name: field_type_enum; Type: TYPE; Schema: public
--
CREATE TYPE public.field_type_enum AS ENUM (
    'text',
    'number',
    'date',
    'color',
    'select',
    'file',
    'multi_select'
);

--
-- Name: form_status_enum; Type: TYPE; Schema: public
--
CREATE TYPE public.form_status_enum AS ENUM (
    'active',
    'draft'
);

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public
--
CREATE TABLE public.admins (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;

--
-- Name: alembic_version; Type: TABLE; Schema: public
--
CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);

--
-- Name: fields; Type: TABLE; Schema: public
--
CREATE TABLE public.fields (
    id integer NOT NULL,
    form_id integer NOT NULL,
    label character varying(255) NOT NULL,
    field_type public.field_type_enum NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    options jsonb,
    CONSTRAINT check_options_logic CHECK ((((field_type = ANY (ARRAY['select'::public.field_type_enum, 'multi_select'::public.field_type_enum])) AND (options IS NOT NULL)) OR ((field_type <> ALL (ARRAY['select'::public.field_type_enum, 'multi_select'::public.field_type_enum])) AND (options IS NULL))))
);

CREATE SEQUENCE public.fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.fields_id_seq OWNED BY public.fields.id;

--
-- Name: form_submissions; Type: TABLE; Schema: public
--
CREATE TABLE public.form_submissions (
    id integer NOT NULL,
    form_id integer NOT NULL,
    user_id integer NOT NULL,
    submitted_at timestamp with time zone DEFAULT now()
);

CREATE SEQUENCE public.form_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.form_submissions_id_seq OWNED BY public.form_submissions.id;

--
-- Name: forms; Type: TABLE; Schema: public
--
CREATE TABLE public.forms (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    display_order integer DEFAULT 0 NOT NULL,
    status public.form_status_enum DEFAULT 'draft'::public.form_status_enum NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE SEQUENCE public.forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.forms_id_seq OWNED BY public.forms.id;

--
-- Name: submission_answers; Type: TABLE; Schema: public
--
CREATE TABLE public.submission_answers (
    id integer NOT NULL,
    submission_id integer NOT NULL,
    field_id integer NOT NULL,
    value text
);

CREATE SEQUENCE public.submission_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.submission_answers_id_seq OWNED BY public.submission_answers.id;

--
-- Name: users; Type: TABLE; Schema: public
--
CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

--
-- Defaults
--
ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);
ALTER TABLE ONLY public.fields ALTER COLUMN id SET DEFAULT nextval('public.fields_id_seq'::regclass);
ALTER TABLE ONLY public.form_submissions ALTER COLUMN id SET DEFAULT nextval('public.form_submissions_id_seq'::regclass);
ALTER TABLE ONLY public.forms ALTER COLUMN id SET DEFAULT nextval('public.forms_id_seq'::regclass);
ALTER TABLE ONLY public.submission_answers ALTER COLUMN id SET DEFAULT nextval('public.submission_answers_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

--
-- Data inserts
--
INSERT INTO public.admins (id, email, password_hash, created_at)
VALUES (1, 'admin1@example.com', '$2b$12$ynvbpQp5qP1ii9vUk9/uXeX2rxhF221iGK5w.RDQD4DcJQuEZYvYW', '2026-04-30 11:05:54.055703+00');

--
-- Sequence SETs
--
SELECT pg_catalog.setval('public.admins_id_seq', 1, true);

--
-- Primary Keys and Unique Constraints
--
ALTER TABLE ONLY public.admins ADD CONSTRAINT admins_email_key UNIQUE (email);
ALTER TABLE ONLY public.admins ADD CONSTRAINT admins_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.alembic_version ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);
ALTER TABLE ONLY public.fields ADD CONSTRAINT fields_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.form_submissions ADD CONSTRAINT form_submissions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.forms ADD CONSTRAINT forms_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.submission_answers ADD CONSTRAINT submission_answers_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- Indexes
--
CREATE INDEX idx_admins_email ON public.admins USING btree (email);
CREATE INDEX idx_answers_field_id ON public.submission_answers USING btree (field_id);
CREATE INDEX idx_answers_submission_id ON public.submission_answers USING btree (submission_id);
CREATE INDEX idx_fields_form_id ON public.fields USING btree (form_id);
CREATE INDEX idx_forms_admin_id ON public.forms USING btree (admin_id);
CREATE INDEX idx_submissions_form_id ON public.form_submissions USING btree (form_id);
CREATE INDEX idx_submissions_user_id ON public.form_submissions USING btree (user_id);
CREATE INDEX idx_users_email ON public.users USING btree (email);

--
-- Foreign Keys
--
ALTER TABLE ONLY public.submission_answers ADD CONSTRAINT fk_answers_field FOREIGN KEY (field_id) REFERENCES public.fields(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.submission_answers ADD CONSTRAINT fk_answers_submission FOREIGN KEY (submission_id) REFERENCES public.form_submissions(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.fields ADD CONSTRAINT fk_fields_form FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.forms ADD CONSTRAINT fk_forms_admin FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.form_submissions ADD CONSTRAINT fk_submissions_form FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.form_submissions ADD CONSTRAINT fk_submissions_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;