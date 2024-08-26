import { formatDistanceToNowStrict } from 'date-fns';

function formatDate(dateString) {
  const date = new Date(dateString);
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export default formatDate;
