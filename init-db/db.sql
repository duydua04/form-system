--
-- PostgreSQL database dump
--

\restrict NCm59HYRRXdiSl4IMdAsLj6qDjUhF1PbH2m5PuEJgCnKoeLzyMSHTWoxi3fA8MD

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

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


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

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

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: hoangduy
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admins_id_seq OWNER TO hoangduy;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hoangduy
--

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

--
-- Name: fields_id_seq; Type: SEQUENCE; Schema: public; Owner: hoangduy
--

CREATE SEQUENCE public.fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fields_id_seq OWNER TO hoangduy;

--
-- Name: fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hoangduy
--

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

--
-- Name: form_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: hoangduy
--

CREATE SEQUENCE public.form_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.form_submissions_id_seq OWNER TO hoangduy;

--
-- Name: form_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hoangduy
--

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

--
-- Name: forms_id_seq; Type: SEQUENCE; Schema: public; Owner: hoangduy
--

CREATE SEQUENCE public.forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.forms_id_seq OWNER TO hoangduy;

--
-- Name: forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hoangduy
--

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

--
-- Name: submission_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: hoangduy
--

CREATE SEQUENCE public.submission_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.submission_answers_id_seq OWNER TO hoangduy;

--
-- Name: submission_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hoangduy
--

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

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: hoangduy
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO hoangduy;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hoangduy
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: fields id; Type: DEFAULT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.fields ALTER COLUMN id SET DEFAULT nextval('public.fields_id_seq'::regclass);


--
-- Name: form_submissions id; Type: DEFAULT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.form_submissions ALTER COLUMN id SET DEFAULT nextval('public.form_submissions_id_seq'::regclass);


--
-- Name: forms id; Type: DEFAULT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.forms ALTER COLUMN id SET DEFAULT nextval('public.forms_id_seq'::regclass);


--
-- Name: submission_answers id; Type: DEFAULT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.submission_answers ALTER COLUMN id SET DEFAULT nextval('public.submission_answers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: hoangduy
--

COPY public.admins (id, email, password_hash, created_at) FROM stdin;
1	admin1@example.com	$2b$12$ynvbpQp5qP1ii9vUk9/uXeX2rxhF221iGK5w.RDQD4DcJQuEZYvYW	2026-04-30 11:05:54.055703+00
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: hoangduy
--

COPY public.alembic_version (version_num) FROM stdin;
\.


--
-- Data for Name: fields; Type: TABLE DATA; Schema: public; Owner: hoangduy
--

COPY public.fields (id, form_id, label, field_type, display_order, is_required, options) FROM stdin;
1	1	Họ và tên	text	0	t	\N
2	1	Mã nhân viênn	text	1	t	\N
3	1	Ngày sinh	date	2	t	\N
4	1	File chứng chỉ (.pdf)	file	3	t	\N
5	2	Họ và tên	text	0	t	\N
6	2	Mã nhân viên 	text	1	t	\N
7	2	Phòng ban	select	2	t	["Nhân sự", "Phát triển phần mềm", "Hạ tầng", "Kế toán", "Kinh doanh"]
8	2	Trong vòng 6 tháng gần đây bạn đã khám sức khỏe tổng quát chưa?	select	3	t	["Đã khám", "Chưa"]
9	2	Chọn ngày đăng ký khám trong các ngày sau (có thể chọn nhiều ngày)	multi_select	4	t	["20-5", "21-5", "22-5", "23-5", "24-5"]
10	3	Nháp 1	text	1	f	\N
11	4	abc123	text	1	f	\N
12	5	Hãy nói xin chào đi	text	1	t	\N
13	6	Họ và tên	text	1	t	\N
14	6	Bạn có hài lòng với lương công ty không	select	2	t	["Có", "Không", "Không ý kiến"]
15	7	Họ và tên	text	1	t	\N
16	7	Mã nhân viên	text	2	t	\N
18	7	Màu	color	4	f	\N
17	7	Ngày sinh	date	3	t	\N
19	7	File giấy tờ tùy thân	file	5	f	\N
\.


--
-- Data for Name: form_submissions; Type: TABLE DATA; Schema: public; Owner: hoangduy
--

COPY public.form_submissions (id, form_id, user_id, submitted_at) FROM stdin;
1	1	1	2026-05-05 15:24:23.920983+00
2	1	1	2026-05-05 15:56:16.39649+00
3	1	1	2026-05-05 16:34:34.603229+00
\.


--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: hoangduy
--

COPY public.forms (id, admin_id, title, description, display_order, status, created_at, updated_at) FROM stdin;
1	1	Khảo sát chứng chỉ tiếng Anh	Nộp chứng chỉ tiếng Anh của nhân viên có hạn trong vòng 2 năm	1	active	2026-05-05 15:20:25.51888+00	2026-05-05 15:20:25.51888+00
2	1	Đăng ký khám sức khỏe nhân viên	Form đăng ký khám sức khỏe cho nhân viên toàn công ty, hoàn thành trong vòng 1 tuần	1	active	2026-05-05 17:12:24.812083+00	2026-05-05 17:12:24.812083+00
4	1	Nháp 2	abc123	1	active	2026-05-05 17:20:55.360548+00	2026-05-05 17:20:55.360548+00
5	1	Xin chào	Form xin chào	1	active	2026-05-05 17:22:00.166975+00	2026-05-05 17:22:00.166975+00
6	1	Khảo sát mức lương công ty	Biểu mẫu dùng để khảo sát mức độ hài lòng của nhân viên với công ty	1	active	2026-05-05 17:23:54.886963+00	2026-05-05 17:23:54.886963+00
7	1	Form Test Hệ Thống	Chỉ để test, không để làm gì	1	active	2026-05-05 17:26:16.798408+00	2026-05-05 17:26:16.798408+00
3	1	Form nháp 1	Không có gì	1	active	2026-05-05 17:20:19.494601+00	2026-05-05 17:34:05.650288+00
\.


--
-- Data for Name: submission_answers; Type: TABLE DATA; Schema: public; Owner: hoangduy
--

COPY public.submission_answers (id, submission_id, field_id, value) FROM stdin;
1	1	1	Hoàng Đình Duy
2	1	2	NV22001245
3	1	3	2003-06-04
4	1	4	form-submissions/uploads/2026/05/20260505_152423_3719a010.pdf
5	2	1	Hoàng Đình Duy
6	2	2	22001245
7	2	3	2003-06-04
8	2	4	form-submissions/uploads/2026/05/20260505_155616_6d0a6732.pdf
9	3	1	Hoàng Đình Duy
10	3	2	22001245
11	3	3	2026-05-06
12	3	4	form-submissions/uploads/2026/05/20260505_163434_e40cff53.pdf
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: hoangduy
--

COPY public.users (id, email, password_hash, created_at) FROM stdin;
1	hoangduy@gmail.com	$2b$12$FqB3r6Y3lPfIZca9wHpRO.c.84Ef2b0Ec2megawprli9Zz4Uok2n2	2026-05-05 15:22:05.499272+00
2	nhanvien1@topcv.vn	$2b$12$NEDTsHYS.vRtnk/F6LEdXOrhBJrxYNu97/TzDv0hNIcqqyja0oUL6	2026-05-05 17:28:31.692831+00
3	nhanvien2@topcv.vn	$2b$12$JlHUgw4YBC0lF1Sf4tPKOuvHT3wk8AwDH0IlJsuOT0AsxQiAv7LHq	2026-05-05 17:29:36.153112+00
4	nhanvien3@topcv.vn	$2b$12$tI09uzfIJsB9Ap1WaL3DJOgqjxT92MAwQycBeKWyoPCrSDdU48O.q	2026-05-05 17:30:03.510773+00
5	nhanvien4@topcv.vn	$2b$12$GZmtpmjPUmdxQITXoh0uoOx817qS0IWYh5nXzfA9HW4icWAVBClde	2026-05-05 17:30:22.621209+00
6	nhanvien5@topcv.vn	$2b$12$AMYQlU6bt8yLyPnQBL6.beOOHY3U4mJvnMqG3XnSIJr1VJ8tXObN.	2026-05-05 17:30:48.78963+00
7	nhanvien6@topcv.vn	$2b$12$TKBFF5Sgp4fywlKtmMlPAe3TLTjDdUBK27cCDvMAao/356Gh9/JNS	2026-05-05 17:31:25.87892+00
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hoangduy
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- Name: fields_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hoangduy
--

SELECT pg_catalog.setval('public.fields_id_seq', 19, true);


--
-- Name: form_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hoangduy
--

SELECT pg_catalog.setval('public.form_submissions_id_seq', 3, true);


--
-- Name: forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hoangduy
--

SELECT pg_catalog.setval('public.forms_id_seq', 7, true);


--
-- Name: submission_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hoangduy
--

SELECT pg_catalog.setval('public.submission_answers_id_seq', 12, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hoangduy
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: fields fields_pkey; Type: CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_pkey PRIMARY KEY (id);


--
-- Name: form_submissions form_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_pkey PRIMARY KEY (id);


--
-- Name: forms forms_pkey; Type: CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT forms_pkey PRIMARY KEY (id);


--
-- Name: submission_answers submission_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.submission_answers
    ADD CONSTRAINT submission_answers_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_admins_email; Type: INDEX; Schema: public; Owner: hoangduy
--

CREATE INDEX idx_admins_email ON public.admins USING btree (email);


--
-- Name: idx_answers_field_id; Type: INDEX; Schema: public; Owner: hoangduy
--

CREATE INDEX idx_answers_field_id ON public.submission_answers USING btree (field_id);


--
-- Name: idx_answers_submission_id; Type: INDEX; Schema: public; Owner: hoangduy
--

CREATE INDEX idx_answers_submission_id ON public.submission_answers USING btree (submission_id);


--
-- Name: idx_fields_form_id; Type: INDEX; Schema: public; Owner: hoangduy
--

CREATE INDEX idx_fields_form_id ON public.fields USING btree (form_id);


--
-- Name: idx_forms_admin_id; Type: INDEX; Schema: public; Owner: hoangduy
--

CREATE INDEX idx_forms_admin_id ON public.forms USING btree (admin_id);


--
-- Name: idx_submissions_form_id; Type: INDEX; Schema: public; Owner: hoangduy
--

CREATE INDEX idx_submissions_form_id ON public.form_submissions USING btree (form_id);


--
-- Name: idx_submissions_user_id; Type: INDEX; Schema: public; Owner: hoangduy
--

CREATE INDEX idx_submissions_user_id ON public.form_submissions USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: hoangduy
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: submission_answers fk_answers_field; Type: FK CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.submission_answers
    ADD CONSTRAINT fk_answers_field FOREIGN KEY (field_id) REFERENCES public.fields(id) ON DELETE CASCADE;


--
-- Name: submission_answers fk_answers_submission; Type: FK CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.submission_answers
    ADD CONSTRAINT fk_answers_submission FOREIGN KEY (submission_id) REFERENCES public.form_submissions(id) ON DELETE CASCADE;


--
-- Name: fields fk_fields_form; Type: FK CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fk_fields_form FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: forms fk_forms_admin; Type: FK CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.forms
    ADD CONSTRAINT fk_forms_admin FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE;


--
-- Name: form_submissions fk_submissions_form; Type: FK CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT fk_submissions_form FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE;


--
-- Name: form_submissions fk_submissions_user; Type: FK CONSTRAINT; Schema: public; Owner: hoangduy
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT fk_submissions_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict NCm59HYRRXdiSl4IMdAsLj6qDjUhF1PbH2m5PuEJgCnKoeLzyMSHTWoxi3fA8MD

