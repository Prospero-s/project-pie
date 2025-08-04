<?php

namespace App\Enum;

enum NotificationType: string
{
    case GROUP_INVITATION = 'group_invitation';
    case REPORT_REMINDER = 'report_reminder';
    case NEW_MESSAGE = 'new_message';
    case MENTION = 'mention';
    case EVENT_REMINDER = 'event_reminder';
    case SYSTEM_ALERT = 'system_alert';
    case FRIEND_REQUEST = 'friend_request';
    case ACCEPTED_REQUEST = 'accepted_request';
    case INVEST_ASSIGNED = 'invest_assigned';
    case NEW_COMMENT = 'new_comment';
    case PASSWORD_CHANGED = 'password_changed';
    case SECURITY_ALERT = 'security_alert';
    case SUBSCRIPTION_EXPIRING = 'subscription_expiring';
    case NEW_MEMBER_JOINED = 'new_member_joined';
    case NEW_INVESTMENT_ADDED = 'new_investment_added';
    case NEW_DOCUMENT_UPLOADED = 'new_document_uploaded';

    public function getValue(): string
    {
        return $this->value;
    }
}
