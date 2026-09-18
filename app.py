import streamlit as st


st.set_page_config(page_title="Support Agent Lab", page_icon=":material/support_agent:", layout="wide")

st.title("Support Agent Lab")
st.caption("A visible LangChain and LangGraph learning project")

ticket, workflow = st.columns([2, 3])

with ticket:
    st.subheader("Customer ticket")
    st.text_area(
        "Message",
        placeholder="Describe the customer's problem...",
        height=180,
        disabled=True,
    )
    st.button("Run workflow", type="primary", disabled=True)

with workflow:
    st.subheader("Workflow")
    st.write("1. Receive ticket")
    st.write("2. Classify request")
    st.write("3. Select support route")
    st.write("4. Draft response or escalate")

st.info("Setup is complete. The next exercise will make this workflow executable and observable.")
