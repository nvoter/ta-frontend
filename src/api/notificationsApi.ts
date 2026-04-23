import {
  getAuthorizationHeaders,
  getCurrentGatewayUrl,
} from './gatewayApi'
import { requestJson } from './httpClient'

export interface NotificationDto {
  createdAt: string
  entityId: string
  entityType: 'APPLICATION_DISCIPLINE' | 'IMPORT'
  id: string
  isRead: boolean
  message: string
  notificationType:
    | 'APPLICATION_CREATED'
    | 'APPLICATION_STATUS_UPDATED'
    | 'APPLICATION_DELETED'
  title: string
}

interface GetNotificationsResponse {
  count: number
  notifications: NotificationDto[]
}

interface MarkNotificationsAsReadResponse {
  updatedCount: number
}

export async function getNotifications(unreadOnly = false) {
  const response = await requestJson<GetNotificationsResponse>({
    baseUrl: getCurrentGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'notifications',
    query: { unreadOnly },
  })

  return response.notifications
}

export async function markNotificationAsRead(notificationId: string) {
  return requestJson<NotificationDto>({
    baseUrl: getCurrentGatewayUrl(),
    headers: getAuthorizationHeaders(),
    method: 'PATCH',
    path: `notifications/${notificationId}`,
  })
}

export async function markAllNotificationsAsRead() {
  return requestJson<MarkNotificationsAsReadResponse>({
    baseUrl: getCurrentGatewayUrl(),
    headers: getAuthorizationHeaders(),
    method: 'PATCH',
    path: 'notifications',
  })
}
