<?php

namespace App\Controller;

use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Sentry\State\HubInterface;
use Sentry\Exception\ExceptionInterface;

class SentryTestController extends AbstractController
{
    public function __construct(private LoggerInterface $logger)
    {
    }

    #[Route('/_sentry-test', name: 'sentry_test')]
    public function testLog()
    {
        // the following code will test if monolog integration logs to sentry
        $this->logger->error('My custom logged error.', ['some' => 'Context Data']);

        // the following code will test if an uncaught exception logs to sentry
        throw new \RuntimeException('Example exception.');

        // pour pipeline
        return new Response('ok');
    }

    #[Route_('/_sentry-test-error', name: 'sentry_test_error')]
    public function testError(HubInterface $sentryHub)
    {
         try {
        throw new \RuntimeException('Example exception.');
    } catch (\Throwable $e) {
        $sentryHub->captureException($e);
        throw $e;
    }
    }
    // pour pipeline
    return new Response('ok');
}
