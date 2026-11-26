export function getApiErrorMessage(error, fallback) {
  const responseError = error?.response?.data?.error
  const validationMessages = responseError?.details
    ?.map((detail) => detail.message)
    .filter(Boolean)

  if (validationMessages?.length) {
    return validationMessages.join(' ')
  }

  if (responseError?.message) {
    return responseError.message
  }

  if (error?.code === 'ECONNABORTED') {
    return 'The server took too long to respond. Please try again.'
  }

  if (!error?.response) {
    return 'Unable to reach SupportFlow. Check that the server is running and try again.'
  }

  return fallback
}
