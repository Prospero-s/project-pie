<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250131005149 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE kpi_data ADD company_id INT NOT NULL');
        $this->addSql('ALTER TABLE kpi_data ADD CONSTRAINT FK_1DC49958979B1AD6 FOREIGN KEY (company_id) REFERENCES company (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_1DC49958979B1AD6 ON kpi_data (company_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE kpi_data DROP CONSTRAINT FK_1DC49958979B1AD6');
        $this->addSql('DROP INDEX IDX_1DC49958979B1AD6');
        $this->addSql('ALTER TABLE kpi_data DROP company_id');
    }
}
