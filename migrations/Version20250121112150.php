<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250121112150 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE company RENAME COLUMN forme_juridique TO business_structures');
        $this->addSql('ALTER INDEX uniq_b1b36a03db8bba08 RENAME TO UNIQ_4FBF094FDB8BBA08');
        $this->addSql('ALTER TABLE company_address RENAME COLUMN num_voie TO street_number');
        $this->addSql('ALTER TABLE company_address RENAME COLUMN type_voie TO street_types');
        $this->addSql('ALTER INDEX uniq_2d1c7556a97d1ac3 RENAME TO UNIQ_2D1C7556979B1AD6');
        $this->addSql('ALTER INDEX uniq_fe44e340a97d1ac3 RENAME TO UNIQ_FE44E340979B1AD6');
        $this->addSql('ALTER INDEX idx_2507390ea97d1ac3 RENAME TO IDX_2507390E979B1AD6');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER INDEX uniq_fe44e340979b1ad6 RENAME TO uniq_fe44e340a97d1ac3');
        $this->addSql('ALTER INDEX idx_2507390e979b1ad6 RENAME TO idx_2507390ea97d1ac3');
        $this->addSql('ALTER TABLE company RENAME COLUMN business_structures TO forme_juridique');
        $this->addSql('ALTER INDEX uniq_4fbf094fdb8bba08 RENAME TO uniq_b1b36a03db8bba08');
        $this->addSql('ALTER TABLE company_address RENAME COLUMN street_number TO num_voie');
        $this->addSql('ALTER TABLE company_address RENAME COLUMN street_types TO type_voie');
        $this->addSql('ALTER INDEX uniq_2d1c7556979b1ad6 RENAME TO uniq_2d1c7556a97d1ac3');
    }
}
