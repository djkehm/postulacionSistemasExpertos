PGDMP  1                    |         
   bd_bodegas    16.3    16.3 $    )           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            *           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            +           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            ,           1262    16394 
   bd_bodegas    DATABASE     l   CREATE DATABASE bd_bodegas WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';
    DROP DATABASE bd_bodegas;
                postgres    false            -           0    0    DATABASE bd_bodegas    ACL     ,   GRANT ALL ON DATABASE bd_bodegas TO prueba;
                   postgres    false    3628            �            1259    16528    bodega_encargado    TABLE     {   CREATE TABLE public.bodega_encargado (
    id_bod_enc integer NOT NULL,
    id_bodega integer,
    id_encargado integer
);
 $   DROP TABLE public.bodega_encargado;
       public         heap    postgres    false            .           0    0    TABLE bodega_encargado    ACL     6   GRANT ALL ON TABLE public.bodega_encargado TO prueba;
          public          postgres    false    220            �            1259    16527    bodega_encargado_id_bod_enc_seq    SEQUENCE     �   CREATE SEQUENCE public.bodega_encargado_id_bod_enc_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE public.bodega_encargado_id_bod_enc_seq;
       public          postgres    false    220            /           0    0    bodega_encargado_id_bod_enc_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE public.bodega_encargado_id_bod_enc_seq OWNED BY public.bodega_encargado.id_bod_enc;
          public          postgres    false    219            0           0    0 (   SEQUENCE bodega_encargado_id_bod_enc_seq    ACL     Q   GRANT SELECT,USAGE ON SEQUENCE public.bodega_encargado_id_bod_enc_seq TO prueba;
          public          postgres    false    219            �            1259    16518    bodegas    TABLE     6  CREATE TABLE public.bodegas (
    id_bodega integer NOT NULL,
    cod_bodega character varying(5) NOT NULL,
    nom_bodega character varying(100),
    direccion character varying(255),
    dotacion integer,
    estado_bodega boolean,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.bodegas;
       public         heap    postgres    false            1           0    0    TABLE bodegas    ACL     -   GRANT ALL ON TABLE public.bodegas TO prueba;
          public          postgres    false    218            �            1259    16517    bodegas_id_bodega_seq    SEQUENCE     �   CREATE SEQUENCE public.bodegas_id_bodega_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.bodegas_id_bodega_seq;
       public          postgres    false    218            2           0    0    bodegas_id_bodega_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.bodegas_id_bodega_seq OWNED BY public.bodegas.id_bodega;
          public          postgres    false    217            3           0    0    SEQUENCE bodegas_id_bodega_seq    ACL     G   GRANT SELECT,USAGE ON SEQUENCE public.bodegas_id_bodega_seq TO prueba;
          public          postgres    false    217            �            1259    16464 
   encargados    TABLE     '  CREATE TABLE public.encargados (
    id_encargado integer NOT NULL,
    run character varying,
    nombre character varying(100),
    primer_apellido character varying(100),
    segundo_apellido character varying(100),
    direccion character varying(255),
    telefono character varying(20)
);
    DROP TABLE public.encargados;
       public         heap    postgres    false            4           0    0    TABLE encargados    ACL     0   GRANT ALL ON TABLE public.encargados TO prueba;
          public          postgres    false    216            �            1259    16463    encargados_id_encargado_seq    SEQUENCE     �   CREATE SEQUENCE public.encargados_id_encargado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.encargados_id_encargado_seq;
       public          postgres    false    216            5           0    0    encargados_id_encargado_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.encargados_id_encargado_seq OWNED BY public.encargados.id_encargado;
          public          postgres    false    215            �            1259    24581    vista_bodega_encargados    VIEW       CREATE VIEW public.vista_bodega_encargados AS
 SELECT b.cod_bodega AS codigo,
    b.nom_bodega AS nombre_bodega,
    b.direccion,
    b.dotacion,
    string_agg(concat(e.nombre, ' ', e.primer_apellido, ' ', e.segundo_apellido), ', '::text) AS nombres_encargados,
    to_char(b.fecha_creacion, 'DD-MM-YYYY'::text) AS fecha_creacion,
        CASE
            WHEN b.estado_bodega THEN 'Activada'::text
            ELSE 'Desactivada'::text
        END AS estado_actual
   FROM ((public.bodegas b
     LEFT JOIN public.bodega_encargado be ON ((b.id_bodega = be.id_bodega)))
     LEFT JOIN public.encargados e ON ((be.id_encargado = e.id_encargado)))
  GROUP BY b.cod_bodega, b.nom_bodega, b.direccion, b.dotacion, b.fecha_creacion, b.estado_bodega
  ORDER BY b.cod_bodega;
 *   DROP VIEW public.vista_bodega_encargados;
       public          postgres    false    220    216    216    218    218    218    218    218    220    218    218    216    216            6           0    0    TABLE vista_bodega_encargados    ACL     =   GRANT ALL ON TABLE public.vista_bodega_encargados TO prueba;
          public          postgres    false    222            �           2604    16531    bodega_encargado id_bod_enc    DEFAULT     �   ALTER TABLE ONLY public.bodega_encargado ALTER COLUMN id_bod_enc SET DEFAULT nextval('public.bodega_encargado_id_bod_enc_seq'::regclass);
 J   ALTER TABLE public.bodega_encargado ALTER COLUMN id_bod_enc DROP DEFAULT;
       public          postgres    false    219    220    220            �           2604    16521    bodegas id_bodega    DEFAULT     v   ALTER TABLE ONLY public.bodegas ALTER COLUMN id_bodega SET DEFAULT nextval('public.bodegas_id_bodega_seq'::regclass);
 @   ALTER TABLE public.bodegas ALTER COLUMN id_bodega DROP DEFAULT;
       public          postgres    false    218    217    218            �           2604    16467    encargados id_encargado    DEFAULT     �   ALTER TABLE ONLY public.encargados ALTER COLUMN id_encargado SET DEFAULT nextval('public.encargados_id_encargado_seq'::regclass);
 F   ALTER TABLE public.encargados ALTER COLUMN id_encargado DROP DEFAULT;
       public          postgres    false    215    216    216            &          0    16528    bodega_encargado 
   TABLE DATA           O   COPY public.bodega_encargado (id_bod_enc, id_bodega, id_encargado) FROM stdin;
    public          postgres    false    220   m+       $          0    16518    bodegas 
   TABLE DATA           x   COPY public.bodegas (id_bodega, cod_bodega, nom_bodega, direccion, dotacion, estado_bodega, fecha_creacion) FROM stdin;
    public          postgres    false    218   �+       "          0    16464 
   encargados 
   TABLE DATA           w   COPY public.encargados (id_encargado, run, nombre, primer_apellido, segundo_apellido, direccion, telefono) FROM stdin;
    public          postgres    false    216   �,       7           0    0    bodega_encargado_id_bod_enc_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('public.bodega_encargado_id_bod_enc_seq', 42, true);
          public          postgres    false    219            8           0    0    bodegas_id_bodega_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.bodegas_id_bodega_seq', 13, true);
          public          postgres    false    217            9           0    0    encargados_id_encargado_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.encargados_id_encargado_seq', 3, true);
          public          postgres    false    215            �           2606    16533 &   bodega_encargado bodega_encargado_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.bodega_encargado
    ADD CONSTRAINT bodega_encargado_pkey PRIMARY KEY (id_bod_enc);
 P   ALTER TABLE ONLY public.bodega_encargado DROP CONSTRAINT bodega_encargado_pkey;
       public            postgres    false    220            �           2606    16526    bodegas bodegas_id_bodega_key 
   CONSTRAINT     ]   ALTER TABLE ONLY public.bodegas
    ADD CONSTRAINT bodegas_id_bodega_key UNIQUE (id_bodega);
 G   ALTER TABLE ONLY public.bodegas DROP CONSTRAINT bodegas_id_bodega_key;
       public            postgres    false    218            �           2606    16524    bodegas bodegas_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.bodegas
    ADD CONSTRAINT bodegas_pkey PRIMARY KEY (cod_bodega);
 >   ALTER TABLE ONLY public.bodegas DROP CONSTRAINT bodegas_pkey;
       public            postgres    false    218            �           2606    16471    encargados encargados_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.encargados
    ADD CONSTRAINT encargados_pkey PRIMARY KEY (id_encargado);
 D   ALTER TABLE ONLY public.encargados DROP CONSTRAINT encargados_pkey;
       public            postgres    false    216            �           2606    16534 0   bodega_encargado bodega_encargado_id_bodega_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.bodega_encargado
    ADD CONSTRAINT bodega_encargado_id_bodega_fkey FOREIGN KEY (id_bodega) REFERENCES public.bodegas(id_bodega);
 Z   ALTER TABLE ONLY public.bodega_encargado DROP CONSTRAINT bodega_encargado_id_bodega_fkey;
       public          postgres    false    220    218    3465            �           2606    16539 3   bodega_encargado bodega_encargado_id_encargado_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.bodega_encargado
    ADD CONSTRAINT bodega_encargado_id_encargado_fkey FOREIGN KEY (id_encargado) REFERENCES public.encargados(id_encargado);
 ]   ALTER TABLE ONLY public.bodega_encargado DROP CONSTRAINT bodega_encargado_id_encargado_fkey;
       public          postgres    false    216    220    3463            &   4   x�ʹ  ��XW���^� Z2�X�����Y����N�t��      $   �   x�m�=N�0��z|
��f��'.Y$�DE�M��������b����X���F�ے�Na��q��K�/�c�N����eB�3H���N"'��y��8�-1�J���1����R�������
�[t��R��K���xU|g��t�3�'k�����`��r�د��)�����&jL�ݚre�X�C:�Hr��W�So}�d^S��ͼ�C~��nI�Cx��q^��zh��R�I0�>�\�      "   �   x�-�=�@F��SLo �"?[
�	��f��bV��6�Va/�P�7�7o���m�fy��0�����a?�ٿ;N�W��km�>�C��&IQc��	nc%��,�	'r�Kp�׉Uߎ7(��V��lC�%�+i9E%#-bXTt$UCi7���z������'�Ǝ�m��2�#�EC\B!���=a     