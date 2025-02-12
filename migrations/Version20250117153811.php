<?php
declare(strict_types=1);
namespace DoctrineMigrations;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250117153811 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE company_address_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE company_investment_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE company_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE representative_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE company_address (
          id INT NOT NULL,
          company_id INT NOT NULL,
          num_voie VARCHAR(10) DEFAULT NULL,
          type_voie VARCHAR(50) DEFAULT NULL,
          voie TEXT DEFAULT NULL,
          code_postal VARCHAR(5) DEFAULT NULL,
          commune TEXT DEFAULT NULL,
          pays VARCHAR(50) NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2D1C7556A97D1AC3 ON company_address (company_id)');
        $this->addSql('CREATE TABLE company_investment (
          id INT NOT NULL,
          company_id INT NOT NULL,
          cognito_id VARCHAR(255) NOT NULL,
          funding_type VARCHAR(50) NOT NULL,
          amount BIGINT NOT NULL,
          currency VARCHAR(3) NOT NULL,
          invested_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FE44E340A97D1AC3 ON company_investment (company_id)');
        $this->addSql('CREATE TABLE company (
          id INT NOT NULL,
          cognito_id TEXT NOT NULL,
          siren VARCHAR(9) NOT NULL,
          denomination TEXT NOT NULL,
          forme_juridique TEXT DEFAULT NULL,
          code_ape TEXT DEFAULT NULL,
          siret VARCHAR(14) DEFAULT NULL,
          sector TEXT DEFAULT NULL,
          updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          deleted_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B1B36A03DB8BBA08 ON company (siren)');
        $this->addSql('CREATE TABLE representative (
          id INT NOT NULL,
          company_id INT DEFAULT NULL,
          nom VARCHAR(255) NOT NULL,
          qualite VARCHAR(255) NOT NULL,
          cognito_id VARCHAR(255) DEFAULT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_2507390EA97D1AC3 ON representative (company_id)');
        $this->addSql('ALTER TABLE
          company_address
        ADD
          CONSTRAINT FK_2D1C7556A97D1AC3 FOREIGN KEY (company_id) REFERENCES company (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          company_investment
        ADD
          CONSTRAINT FK_FE44E340A97D1AC3 FOREIGN KEY (company_id) REFERENCES company (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          representative
        ADD
          CONSTRAINT FK_2507390EA97D1AC3 FOREIGN KEY (company_id) REFERENCES company (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE company_address_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE company_investment_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE company_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE representative_id_seq CASCADE');
        $this->addSql('ALTER TABLE company_address DROP CONSTRAINT FK_2D1C7556A97D1AC3');
        $this->addSql('ALTER TABLE company_investment DROP CONSTRAINT FK_FE44E340A97D1AC3');
        $this->addSql('ALTER TABLE representative DROP CONSTRAINT FK_2507390EA97D1AC3');
        $this->addSql('DROP TABLE company_address');
        $this->addSql('DROP TABLE company_investment');
        $this->addSql('DROP TABLE company');
        $this->addSql('DROP TABLE representative');
    }
}