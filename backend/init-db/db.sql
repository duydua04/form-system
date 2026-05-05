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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

--
-- Name: field_type_enum; Type: TYPE; Schema: public; Owner: hoangduy
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

ALTER TYPE public.field_type_enum OWNER TO hoangduy;

--
-- Name: form_status_enum; Type: TYPE; Schema: public; Owner: hoangduy
--
CREATE TYPE public.form_status_enum AS ENUM (
    'active',
    'draft'
);

ALTER TYPE public.form_status_enum OWNER TO hoangduy;

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: hoangduy
--
CREATE TABLE public.admins (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.admins OWNER TO hoangduy;

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.admins_id_seq OWNER TO hoangduy;
ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: hoangduy
--
CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);

ALTER TABLE public.alembic_version OWNER TO hoangduy;

--
-- Name: fields; Type: TABLE; Schema: public; Owner: hoangduy
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

ALTER TABLE public.fields OWNER TO hoangduy;

CREATE SEQUENCE public.fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.fields_id_seq OWNER TO hoangduy;
ALTER SEQUENCE public.fields_id_seq OWNED BY public.fields.id;

--
-- Name: form_submissions; Type: TABLE; Schema: public; Owner: hoangduy
--
CREATE TABLE public.form_submissions (
    id integer NOT NULL,
    form_id integer NOT NULL,
    user_id integer NOT NULL,
    submitted_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.form_submissions OWNER TO hoangduy;

CREATE SEQUENCE public.form_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.form_submissions_id_seq OWNER TO hoangduy;
ALTER SEQUENCE public.form_submissions_id_seq OWNED BY public.form_submissions.id;

--
-- Name: forms; Type: TABLE; Schema: public; Owner: hoangduy
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

ALTER TABLE public.forms OWNER TO hoangduy;

CREATE SEQUENCE public.forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.forms_id_seq OWNER TO hoangduy;
ALTER SEQUENCE public.forms_id_seq OWNED BY public.forms.id;

--
-- Name: submission_answers; Type: TABLE; Schema: public; Owner: hoangduy
--
CREATE TABLE public.submission_answers (
    id integer NOT NULL,
    submission_id integer NOT NULL,
    field_id integer NOT NULL,
    value text
);

ALTER TABLE public.submission_answers OWNER TO hoangduy;

CREATE SEQUENCE public.submission_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.submission_answers_id_seq OWNER TO hoangduy;
ALTER SEQUENCE public.submission_answers_id_seq OWNED BY public.submission_answers.id;

--
-- Name: users; Type: TABLE; Schema: public; Owner: hoangduy
--
CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.users OWNER TO hoangduy;

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.users_id_seq OWNER TO hoangduy;
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

COPY public.admins (id, email, password_hash, created_at) FROM stdin;
1	admin1@example.com	$2b$12$ynvbpQp5qP1ii9vUk9/uXeX2rxhF221iGK5w.RDQD4DcJQuEZYvYW	2026-04-30 11:05:54.055703+00
\.

COPY public.alembic_version (version_num) FROM stdin;
\.

COPY public.fields (id, form_id, label, field_type, display_order, is_required, options) FROM stdin;
3	2	Mã nhân viên	text	2	t	\N
4	2	Họ tên	text	1	t	\N
6	3	Họ và tên	text	0	t	\N
7	3	Mã nhân viên	text	1	t	\N
8	3	Bạn sẽ tham dự với bao nhiêu người ??	number	2	t	\N
10	3	Bạn biết diễn giả được mời đến là ai không	select	4	t	["Có", "Không"]
11	3	Bạn thích màu gì	color	6	f	\N
12	3	Nhà bạn có mấy người ?	number	5	f	\N
9	3	Bạn biết thông tin này qua đâu	multi_select	3	t	["Trưởng phòng", "Tự biết", "Page công ty", "Đoán bừa", "Chịu"]
5	2	Ngày sinhhh	date	0	t	\N
13	4	???	text	1	f	\N
14	5	agsdfgsdgs	text	1	f	\N
15	6	2344	text	1	f	\N
16	7	12345	text	1	f	\N
17	8	Khong co gi	text	1	f	\N
18	10	abc123	text	1	f	\N
19	12	File gốc chứng chỉ	file	1	t	\N
\.

COPY public.form_submissions (id, form_id, user_id, submitted_at) FROM stdin;
1	2	1	2026-05-03 04:29:36.009487+00
2	2	1	2026-05-03 06:55:51.312704+00
3	3	1	2026-05-03 08:17:12.647246+00
4	2	1	2026-05-04 02:35:58.697798+00
5	3	1	2026-05-04 02:59:15.941911+00
6	12	1	2026-05-04 08:55:31.433862+00
7	12	1	2026-05-04 09:06:44.229816+00
\.

COPY public.forms (id, admin_id, title, description, display_order, status, created_at, updated_at) FROM stdin;
3	1	Đăng ký tham gia sự kiện	Đăng ký tham gia sự kiện với sự kiện tư vấn chi tiêu hợp lý trong gia đình	2	active	2026-05-03 07:16:02.939395+00	2026-05-03 07:16:02.939395+00
4	1	1	2345	3	active	2026-05-03 17:01:19.400058+00	2026-05-03 17:01:19.400058+00
5	1	11	1112223333444	1	active	2026-05-03 17:02:16.306413+00	2026-05-03 17:02:16.306413+00
6	1	434	gsfg	1	active	2026-05-03 17:02:43.339574+00	2026-05-03 17:02:43.339574+00
7	1	12345	123456	1	active	2026-05-03 17:03:49.890571+00	2026-05-03 17:03:49.890571+00
8	1	abc123	abc123	1	active	2026-05-03 17:06:32.773289+00	2026-05-03 17:06:32.773289+00
9	1	abc12345	abc123	5	active	2026-05-03 17:07:18.304618+00	2026-05-03 17:07:18.304618+00
10	1	123456abcdc	Không có gì	3	active	2026-05-04 02:11:15.689083+00	2026-05-04 02:11:15.689083+00
11	1	Hoàng Đình Duy	123456	8	draft	2026-05-04 02:24:04.404777+00	2026-05-04 02:24:04.404777+00
2	1	Khảo sát sức khỏe	Khảo sát tình trạng sức khỏe của nhân viên	1	active	2026-05-01 01:50:45.489495+00	2026-05-04 06:51:06.274938+00
12	1	Nộp chứng chỉ tiếng anh	Nộp chứng chỉ Toeic ngay cho công ty	1	active	2026-05-04 08:54:40.61192+00	2026-05-04 08:54:40.61192+00
\.

COPY public.submission_answers (id, submission_id, field_id, value) FROM stdin;
1	1	3	NV22001245
2	1	4	Hoàng Đình Duy
3	1	5	2003-06-04
4	2	3	addfasdbsfwqe
5	2	4	Đoạn văn là đơn vị trực tiếp tạo nên văn bản, bao gồm nhiều câu văn liên kết chsdsdf
6	2	5	2003-02-03
7	3	6	Hoàng Đình Duy
8	3	7	NV22001245
9	3	8	3
10	3	9	Chịu
11	3	10	Có
12	3	11	#17e856
13	3	12	4
14	4	3	ấgigd
15	4	4	hkajksj
16	4	5	2026-05-05
17	5	6	Hoàng Đình Duy
18	5	7	NV22001245
19	5	8	34
20	5	10	Có
21	5	11	#b51212
22	5	12	4
23	5	9	Trưởng phòng, Tự biết
24	6	19	form-submissions/uploads/2026/05/20260504_155531_f05116de.pdf
25	7	19	form-submissions/uploads/2026/05/20260504_160644_8906819c.pdf
\.

COPY public.users (id, email, password_hash, created_at) FROM stdin;
1	hoangduy@example.com	$2b$12$ikNApZhUCvgYzEhHVmu2..SlUlR2hOPtr2CSZPlGuJnUOwkMmcFLq	2026-05-01 01:20:48.70451+00
\.

--
-- Sequence SETs
--
SELECT pg_catalog.setval('public.admins_id_seq', 1, true);
SELECT pg_catalog.setval('public.fields_id_seq', 19, true);
SELECT pg_catalog.setval('public.form_submissions_id_seq', 7, true);
SELECT pg_catalog.setval('public.forms_id_seq', 12, true);
SELECT pg_catalog.setval('public.submission_answers_id_seq', 25, true);
SELECT pg_catalog.setval('public.users_id_seq', 1, true);

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