import streamlit as st
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# 1. LIGAÇÃO AO BANCO DE DADOS (FIRESTORE)
if not firebase_admin._apps:
    # O Streamlit guarda as chaves num dicionário chamado st.secrets
    cred_dict = dict(st.secrets["firebase_credentials"])
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# 2. LIGAÇÃO À IA (GEMINI)
genai.configure(api_key=st.secrets["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash')

st.title("🚀 Impacto X Control")

# 3. SELEÇÃO DE USUÁRIO (Para os teus 5 amigos)
usuarios = ["Usuário 1", "Usuário 2", "Usuário 3", "Usuário 4", "Usuário 5"]
nome_usuario = st.sidebar.selectbox("Quem está a usar o sistema?", usuarios)

# Chat interface
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Como posso ajudar o Impacto X?"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Resposta da IA
    response = model.generate_content(prompt)
    
    with st.chat_message("assistant"):
        st.markdown(response.text)
    
    # SALVAR NO BANCO DE DADOS
    doc_ref = db.collection("historico").document()
    doc_ref.set({
        "usuario": nome_usuario,
        "pergunta": prompt,
        "resposta": response.text,
        "data": datetime.now()
    })
