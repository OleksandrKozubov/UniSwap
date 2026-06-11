--
-- PostgreSQL database dump
--

\restrict 8FdfjeEDg7BwDPVYvfsOUlAVaG5COuICqMxht3RoEVVIe9frbLlXRZ0NcNAiGhO

-- Dumped from database version 18.3 (Postgres.app)
-- Dumped by pg_dump version 18.2

-- Started on 2026-06-11 23:22:14 EEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16407)
-- Name: categories; Type: TABLE; Schema: public; Owner: pllskip
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.categories OWNER TO pllskip;

--
-- TOC entry 221 (class 1259 OID 16406)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: pllskip
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO pllskip;

--
-- TOC entry 3876 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pllskip
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 226 (class 1259 OID 16444)
-- Name: listing_images; Type: TABLE; Schema: public; Owner: pllskip
--

CREATE TABLE public.listing_images (
    id integer NOT NULL,
    listing_id integer,
    image_url text
);


ALTER TABLE public.listing_images OWNER TO pllskip;

--
-- TOC entry 225 (class 1259 OID 16443)
-- Name: listing_images_id_seq; Type: SEQUENCE; Schema: public; Owner: pllskip
--

CREATE SEQUENCE public.listing_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.listing_images_id_seq OWNER TO pllskip;

--
-- TOC entry 3877 (class 0 OID 0)
-- Dependencies: 225
-- Name: listing_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pllskip
--

ALTER SEQUENCE public.listing_images_id_seq OWNED BY public.listing_images.id;


--
-- TOC entry 224 (class 1259 OID 16418)
-- Name: listings; Type: TABLE; Schema: public; Owner: pllskip
--

CREATE TABLE public.listings (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    price integer,
    user_id integer,
    category_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    location text,
    image_url text
);


ALTER TABLE public.listings OWNER TO pllskip;

--
-- TOC entry 223 (class 1259 OID 16417)
-- Name: listings_id_seq; Type: SEQUENCE; Schema: public; Owner: pllskip
--

CREATE SEQUENCE public.listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.listings_id_seq OWNER TO pllskip;

--
-- TOC entry 3878 (class 0 OID 0)
-- Dependencies: 223
-- Name: listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pllskip
--

ALTER SEQUENCE public.listings_id_seq OWNED BY public.listings.id;


--
-- TOC entry 228 (class 1259 OID 16459)
-- Name: messages; Type: TABLE; Schema: public; Owner: pllskip
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer,
    receiver_id integer,
    listing_id integer,
    text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false
);


ALTER TABLE public.messages OWNER TO pllskip;

--
-- TOC entry 227 (class 1259 OID 16458)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: pllskip
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO pllskip;

--
-- TOC entry 3879 (class 0 OID 0)
-- Dependencies: 227
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pllskip
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 229 (class 1259 OID 16470)
-- Name: saved_listings; Type: TABLE; Schema: public; Owner: pllskip
--

CREATE TABLE public.saved_listings (
    user_id integer NOT NULL,
    listing_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.saved_listings OWNER TO pllskip;

--
-- TOC entry 220 (class 1259 OID 16392)
-- Name: users; Type: TABLE; Schema: public; Owner: pllskip
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    name text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password text NOT NULL,
    university text,
    avatar_url text
);


ALTER TABLE public.users OWNER TO pllskip;

--
-- TOC entry 219 (class 1259 OID 16391)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: pllskip
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO pllskip;

--
-- TOC entry 3880 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pllskip
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3696 (class 2604 OID 16410)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 3699 (class 2604 OID 16447)
-- Name: listing_images id; Type: DEFAULT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.listing_images ALTER COLUMN id SET DEFAULT nextval('public.listing_images_id_seq'::regclass);


--
-- TOC entry 3697 (class 2604 OID 16421)
-- Name: listings id; Type: DEFAULT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.listings ALTER COLUMN id SET DEFAULT nextval('public.listings_id_seq'::regclass);


--
-- TOC entry 3700 (class 2604 OID 16462)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 3694 (class 2604 OID 16395)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3709 (class 2606 OID 16416)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3713 (class 2606 OID 16452)
-- Name: listing_images listing_images_pkey; Type: CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.listing_images
    ADD CONSTRAINT listing_images_pkey PRIMARY KEY (id);


--
-- TOC entry 3711 (class 2606 OID 16428)
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- TOC entry 3715 (class 2606 OID 16468)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 3718 (class 2606 OID 16477)
-- Name: saved_listings saved_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.saved_listings
    ADD CONSTRAINT saved_listings_pkey PRIMARY KEY (user_id, listing_id);


--
-- TOC entry 3705 (class 2606 OID 16404)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3707 (class 2606 OID 16402)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3716 (class 1259 OID 16488)
-- Name: saved_listings_listing_id_idx; Type: INDEX; Schema: public; Owner: pllskip
--

CREATE INDEX saved_listings_listing_id_idx ON public.saved_listings USING btree (listing_id);


--
-- TOC entry 3721 (class 2606 OID 16453)
-- Name: listing_images listing_images_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.listing_images
    ADD CONSTRAINT listing_images_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- TOC entry 3719 (class 2606 OID 16434)
-- Name: listings listings_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 3720 (class 2606 OID 16429)
-- Name: listings listings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3722 (class 2606 OID 16483)
-- Name: saved_listings saved_listings_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.saved_listings
    ADD CONSTRAINT saved_listings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- TOC entry 3723 (class 2606 OID 16478)
-- Name: saved_listings saved_listings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pllskip
--

ALTER TABLE ONLY public.saved_listings
    ADD CONSTRAINT saved_listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-06-11 23:22:14 EEST

--
-- PostgreSQL database dump complete
--

\unrestrict 8FdfjeEDg7BwDPVYvfsOUlAVaG5COuICqMxht3RoEVVIe9frbLlXRZ0NcNAiGhO

