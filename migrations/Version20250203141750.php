<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250203141750 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE kpi_data_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE upload_document_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE kpi_data (id INT NOT NULL, company_id INT NOT NULL, kpi JSON NOT NULL, pdf_url VARCHAR(255) DEFAULT NULL, status VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, deleted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_1DC49958979B1AD6 ON kpi_data (company_id)');
        $this->addSql('COMMENT ON COLUMN kpi_data.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN kpi_data.deleted_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE upload_document (id INT NOT NULL, user_id INT NOT NULL, kpi_data_id INT NOT NULL, uploaded_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, status VARCHAR(50) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_9F1E7213A76ED395 ON upload_document (user_id)');
        $this->addSql('CREATE INDEX IDX_9F1E721338648DDF ON upload_document (kpi_data_id)');
        $this->addSql('ALTER TABLE kpi_data ADD CONSTRAINT FK_1DC49958979B1AD6 FOREIGN KEY (company_id) REFERENCES company (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE upload_document ADD CONSTRAINT FK_9F1E7213A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE upload_document ADD CONSTRAINT FK_9F1E721338648DDF FOREIGN KEY (kpi_data_id) REFERENCES kpi_data (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE kpi_data_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE upload_document_id_seq CASCADE');
        $this->addSql('ALTER TABLE kpi_data DROP CONSTRAINT FK_1DC49958979B1AD6');
        $this->addSql('ALTER TABLE upload_document DROP CONSTRAINT FK_9F1E7213A76ED395');
        $this->addSql('ALTER TABLE upload_document DROP CONSTRAINT FK_9F1E721338648DDF');
        $this->addSql('DROP TABLE kpi_data');
        $this->addSql('DROP TABLE upload_document');
    }
}
