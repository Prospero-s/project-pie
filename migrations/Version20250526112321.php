<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250526112321 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE kpi_data_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE upload_document_id_seq CASCADE');
        $this->addSql('CREATE TABLE document (
          id UUID NOT NULL,
          company_id INT NOT NULL,
          user_group_id INT DEFAULT NULL,
          blob TEXT NOT NULL,
          add_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          year INT NOT NULL,
          periodicity VARCHAR(10) NOT NULL,
          filename VARCHAR(255) DEFAULT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_D8698A76979B1AD6 ON document (company_id)');
        $this->addSql('CREATE INDEX IDX_D8698A761ED93D47 ON document (user_group_id)');
        $this->addSql('COMMENT ON COLUMN document.id IS \'(DC2Type:uuid)\'');
        $this->addSql('CREATE TABLE kpi (
          id UUID NOT NULL,
          document_id UUID NOT NULL,
          name VARCHAR(255) NOT NULL,
          value VARCHAR(255) NOT NULL,
          period VARCHAR(10) NOT NULL,
          numeric_value DOUBLE PRECISION DEFAULT NULL,
          unit VARCHAR(20) DEFAULT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_A0925DD9C33F7837 ON kpi (document_id)');
        $this->addSql('COMMENT ON COLUMN kpi.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN kpi.document_id IS \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE
          document
        ADD
          CONSTRAINT FK_D8698A76979B1AD6 FOREIGN KEY (company_id) REFERENCES company (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          document
        ADD
          CONSTRAINT FK_D8698A761ED93D47 FOREIGN KEY (user_group_id) REFERENCES user_group (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          kpi
        ADD
          CONSTRAINT FK_A0925DD9C33F7837 FOREIGN KEY (document_id) REFERENCES document (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE upload_document DROP CONSTRAINT fk_9f1e7213a76ed395');
        $this->addSql('ALTER TABLE upload_document DROP CONSTRAINT fk_9f1e721338648ddf');
        $this->addSql('ALTER TABLE kpi_data DROP CONSTRAINT fk_1dc49958979b1ad6');
        $this->addSql('DROP TABLE upload_document');
        $this->addSql('DROP TABLE kpi_data');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE kpi_data_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE upload_document_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE upload_document (
          id INT NOT NULL,
          user_id INT NOT NULL,
          kpi_data_id INT NOT NULL,
          uploaded_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX idx_9f1e721338648ddf ON upload_document (kpi_data_id)');
        $this->addSql('CREATE INDEX idx_9f1e7213a76ed395 ON upload_document (user_id)');
        $this->addSql('CREATE TABLE kpi_data (
          id INT NOT NULL,
          company_id INT NOT NULL,
          kpi JSON NOT NULL,
          pdf_url VARCHAR(255) DEFAULT NULL,
          status VARCHAR(255) NOT NULL,
          created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
          deleted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX idx_1dc49958979b1ad6 ON kpi_data (company_id)');
        $this->addSql('COMMENT ON COLUMN kpi_data.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN kpi_data.deleted_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE
          upload_document
        ADD
          CONSTRAINT fk_9f1e7213a76ed395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          upload_document
        ADD
          CONSTRAINT fk_9f1e721338648ddf FOREIGN KEY (kpi_data_id) REFERENCES kpi_data (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          kpi_data
        ADD
          CONSTRAINT fk_1dc49958979b1ad6 FOREIGN KEY (company_id) REFERENCES company (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE document DROP CONSTRAINT FK_D8698A76979B1AD6');
        $this->addSql('ALTER TABLE document DROP CONSTRAINT FK_D8698A761ED93D47');
        $this->addSql('ALTER TABLE kpi DROP CONSTRAINT FK_A0925DD9C33F7837');
        $this->addSql('DROP TABLE document');
        $this->addSql('DROP TABLE kpi');
    }
}
