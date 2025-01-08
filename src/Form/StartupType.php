<?php

namespace App\Form;

use App\Component\Form\AbstractType;
use App\Component\Form\FormBuilderInterface;
use App\Component\Form\Extension\Core\Type\TextType;
use App\Component\Form\Extension\Core\Type\SubmitType;
use App\Component\OptionsResolver\OptionsResolver;

class StartupType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('siren', TextType::class, [
                'label' => 'SIREN',
                'required' => true,
                'attr' => ['placeholder' => 'Entrez le SIREN (9 chiffres)'],
            ])
            ->add('submit', SubmitType::class, ['label' => 'Rechercher']);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([]);
    }
}
