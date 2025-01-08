<?php

namespace App\Controller;

use App\Entity\Reminder;
use App\Entity\User;
use App\Entity\Enterprise;
use App\Repository\ReminderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class ReminderController extends AbstractController
{
    #[Route('/reminder', name: 'reminder_list', methods: ['GET'])]
    public function list(ReminderRepository $reminderRepository): Response
    {
        $reminders = $reminderRepository->findAll();

        return $this->json($reminders, Response::HTTP_OK, [], [
            'groups' => ['reminder:read']
        ]);
    }

    #[Route('/reminder/{id}', name: 'reminder_show', methods: ['GET'])]
    public function show(int $id, ReminderRepository $reminderRepository): Response
    {
        $reminder = $reminderRepository->find($id);

        if (!$reminder) {
            return $this->json(['error' => 'Reminder not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($reminder, Response::HTTP_OK, [], [
            'groups' => ['reminder:read']
        ]);
    }

    #[Route('/reminder', name: 'reminder_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): Response
    {
        $data = json_decode($request->getContent(), true);

        $reminder = new Reminder();
        $this->setReminderData($reminder, $data, $em);

        $em->persist($reminder);
        $em->flush();

        return $this->json($reminder, Response::HTTP_CREATED, [], [
            'groups' => ['reminder:read']
        ]);
    }

    #[Route('/reminder/{id}', name: 'reminder_update', methods: ['PUT'])]
    public function update(int $id, Request $request, ReminderRepository $reminderRepository, EntityManagerInterface $em): Response
    {
        $reminder = $reminderRepository->find($id);

        if (!$reminder) {
            return $this->json(['error' => 'Reminder not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $this->setReminderData($reminder, $data, $em);

        $em->flush();

        return $this->json($reminder, Response::HTTP_OK, [], [
            'groups' => ['reminder:read']
        ]);
    }

    #[Route('/reminder/{id}', name: 'reminder_delete', methods: ['DELETE'])]
    public function delete(int $id, ReminderRepository $reminderRepository, EntityManagerInterface $em): Response
    {
        $reminder = $reminderRepository->find($id);

        if (!$reminder) {
            return $this->json(['error' => 'Reminder not found'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($reminder);
        $em->flush();

        return $this->json(['message' => 'Reminder deleted successfully'], Response::HTTP_OK);
    }

    private function setReminderData(Reminder $reminder, array $data, EntityManagerInterface $em): void
    {
        if (isset($data['trigers'])) {
            $reminder->setTrigers($data['trigers']);
        }
        if (isset($data['start_date'])) {
            $reminder->setStartDate(new \DateTime($data['start_date']));
        }
        if (isset($data['end_date'])) {
            $reminder->setEndDate(new \DateTime($data['end_date']));
        }
        if (isset($data['entreprise_id'])) {
            $enterprise = $em->getRepository(Enterprise::class)->find($data['entreprise_id']);
            $reminder->setEnterprise($enterprise);
        }
        if (isset($data['user_id'])) {
            $user = $em->getRepository(User::class)->find($data['user_id']);
            $reminder->setUserId($user);
        }
    }
}
