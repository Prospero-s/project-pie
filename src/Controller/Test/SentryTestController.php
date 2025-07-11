<?php

namespace App\Controller\Test;

use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Sentry\State\HubInterface;
use Sentry\Exception\ExceptionInterface;
use Symfony\Component\HttpFoundation\Response;

class SentryTestController extends AbstractController
{
    public function __construct(private LoggerInterface $logger)
    {
    }

    #[Route('/_sentry-test', name: 'sentry_test')]
    public function testLog(): Response
    {
        // the following code will test if monolog integration logs to sentry
        $this->logger->error('My custom logged error.', ['some' => 'Context Data']);

        // the following code will test if an uncaught exception logs to sentry
        throw new \RuntimeException('Example exception.');

    }

    #[Route('/_sentry-test-error', name: 'sentry_test_error')]
    public function testError(HubInterface $sentryHub):Response
    {
        try {
            throw new \RuntimeException('Example exception.');
        } catch (\Throwable $e) {
            $sentryHub->captureException($e);
            throw $e;
        }
    }
}
