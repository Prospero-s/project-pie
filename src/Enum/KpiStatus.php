<?php

namespace App\Enum;

enum KpiStatus: string
{
    case PROCESSED = 'processed';
    case PENDING = 'pending';
    case FAILED = 'failed';

    public function getValue(): string
    {
        return $this->value;
    }
} 