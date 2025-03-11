<?php

namespace App\Service\Company;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use DateTime;

class FilterQueryProcessor
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function processFilters(array $queryParams, array $selectedFields, string $entityClass)
    {
        $alias = 'c'; //company

        $qb = $this->entityManager->createQueryBuilder();

        //ajouter les différents selects
        if (!empty($selectedFields)) {
            $fields = array_map(fn($field) => "$alias.$field", $selectedFields);
            $qb->select(implode(', ', $fields));
        } else {
            $qb->select($alias);
        }
    
        foreach ($queryParams as $field => $value) {
            if ($field === 'startDate') {
                $qb->andWhere("$alias.createdAt >= :startDate")
                   ->setParameter('startDate', new DateTime($value));
                continue;
            }
            if ($field === 'endDate') {
                $qb->andWhere("$alias.createdAt <= :endDate")
                   ->setParameter('endDate', new DateTime($value));
                continue;
            }

            // filtres standards
            if (is_array($value)) {
                foreach ($value as $operator => $val) {
                    $paramName = str_replace('.', '_', $field) . '_' . $operator;

                    switch ($operator) {
                        case 'min':
                            $qb->andWhere("$alias.$field >= :$paramName");
                            break;
                        case 'max':
                            $qb->andWhere("$alias.$field <= :$paramName");
                            break;
                        case 'like':
                            $qb->andWhere("$alias.$field LIKE :$paramName");
                            $val = "%$val%";
                            break;
                        case 'between':
                            [$start, $end] = explode(',', $val);
                            $qb->andWhere("$alias.$field BETWEEN :${paramName}_start AND :${paramName}_end")
                               ->setParameter("${paramName}_start", new DateTime($start))
                               ->setParameter("${paramName}_end", new DateTime($end));
                            continue 2;
                    }
                    $qb->setParameter($paramName, $val);
                }
            } else {
                $paramName = str_replace('.', '_', $field);
                $qb->andWhere("$alias.$field = :$paramName")
                   ->setParameter($paramName, $value);
            }
        }

        if ($request->query->has('sort')) {
            $sortParams = explode(',', $request->query->get('sort'));
            foreach ($sortParams as $sortParam) {
                [$sortField, $sortDirection] = explode(':', $sortParam) + [1 => 'asc'];
                $sortDirection = strtolower($sortDirection) === 'desc' ? 'DESC' : 'ASC';

                $qb->addOrderBy("$alias.$sortField", $sortDirection);
            }
        }

        return $qb->getQuery()->getResult();
    }
}
