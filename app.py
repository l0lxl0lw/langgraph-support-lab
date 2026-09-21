import streamlit as st

from workflow import workflow as support_workflow


st.set_page_config(page_title="Support Agent Lab", page_icon=":material/support_agent:", layout="wide")

st.title("Support Agent Lab")
st.caption("A visible LangChain and LangGraph learning project")

ticket_column, workflow_column = st.columns([2, 3])

with ticket_column:
    st.subheader("Customer ticket")
    ticket = st.text_area(
        "Message",
        placeholder="Describe the customer's problem...",
        height=180,
    )
    run_workflow = st.button("Run workflow", type="primary")

if run_workflow:
    if ticket.strip():
        st.session_state.workflow_result = support_workflow.invoke(
            {"ticket": ticket.strip(), "trace": []}
        )
    else:
        st.warning("Enter a customer message before running the workflow.")

with workflow_column:
    st.subheader("Workflow")
    st.write("1. Receive ticket")
    st.write("2. Classify request")
    st.write("3. Select support route")
    st.write("4. Draft response or escalate")

    result = st.session_state.get("workflow_result")
    if result:
        st.success("Workflow complete")
        st.metric("Nodes executed", len(result["trace"]))
        st.code(" -> ".join(result["trace"]), language=None)
        with st.expander("Graph state", expanded=True):
            st.json(result)
    else:
        st.info("Submit a ticket to inspect the graph state and execution trace.")
