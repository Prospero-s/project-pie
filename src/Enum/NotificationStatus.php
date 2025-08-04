<?php

namespace App\Enum;

enum NotificationStatus: string
{
    case SENT = 'sent';
    case READ = 'read';
    case DELETED = 'deleted';

    public function getValue(): string
    {
        return $this->value;
    }
}
