import { apiFetch } from './apiFetch';
import { getServerUrl } from './getServerUrl';

// API call to fetch tasks
const fetchTasks = async (selectedState = '', selectedTransactionType = '') => {
  try {
    console.log('Fetching tasks with filters:', { selectedState, selectedTransactionType });
    let url = `${getServerUrl()}/api/dates/calendar`;
    const params = new URLSearchParams();
    if (selectedState) params.append("state", selectedState);
    if (selectedTransactionType) params.append("transactionType", selectedTransactionType);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await apiFetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.transactions.flatMap((transaction) =>
      transaction.dates.map((date) => ({
        transactionId: transaction.transaction_id,
        transactionName: transaction.transaction_name,
        transactionType: transaction.transaction_type,
        stageId: date.stage_id,
        taskId: date.task.task_id,
        transactionDetailId: date.task.transaction_detail_id,
        address: `${transaction.address}, ${transaction.city}, ${transaction.state}`,
        taskName: date.task.task_name,
        enteredDate: date.task_due_date
          ? new Date(`${date.task_due_date}T00:00:00`)
          : null,
        taskStatus: date.task.task_status,
        taskIsSkipped: date.task.is_skipped,
        taskSkipReason: date.task.skip_reason
      }))
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export default fetchTasks;