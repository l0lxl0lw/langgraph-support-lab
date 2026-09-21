const form = document.querySelector("#ticket-form");
const ticketInput = document.querySelector("#ticket");
const emptyState = document.querySelector("#empty-state");
const result = document.querySelector("#result");
const stateOutput = document.querySelector("#state");
const receiveNode = document.querySelector("#receive-node");

document.querySelectorAll("[data-ticket]").forEach((button) => {
  button.addEventListener("click", () => {
    ticketInput.value = button.dataset.ticket;
    ticketInput.focus();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const ticket = ticketInput.value.trim();
  if (!ticket) return;

  const graphState = {
    ticket,
    trace: ["receive_ticket"],
  };

  stateOutput.textContent = JSON.stringify(graphState, null, 2);
  emptyState.hidden = true;
  result.hidden = false;
  receiveNode.classList.add("executed");
});
