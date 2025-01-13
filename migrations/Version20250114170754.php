<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250114170754 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE address_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE enterprise_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE investment_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE representative_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE address (
          id INT NOT NULL,
          enterprise_id INT NOT NULL,
          num_voie VARCHAR(10) DEFAULT NULL,
          type_voie VARCHAR(50) DEFAULT NULL,
          voie TEXT DEFAULT NULL,
          code_postal VARCHAR(5) DEFAULT NULL,
          commune TEXT DEFAULT NULL,
          pays VARCHAR(50) NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D4E6F81A97D1AC3 ON address (enterprise_id)');
        $this->addSql('CREATE TABLE enterprise (
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
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B1B36A03DB8BBA08 ON enterprise (siren)');
        $this->addSql('CREATE TABLE investment (
          id INT NOT NULL,
          enterprise_id INT NOT NULL,
          cognito_id VARCHAR(255) NOT NULL,
          funding_type VARCHAR(50) NOT NULL,
          amount BIGINT NOT NULL,
          currency VARCHAR(3) NOT NULL,
          invested_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_43CA0AD6A97D1AC3 ON investment (enterprise_id)');
        $this->addSql('CREATE TABLE representative (
          id INT NOT NULL,
          enterprise_id INT DEFAULT NULL,
          nom VARCHAR(255) NOT NULL,
          qualite VARCHAR(255) NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_2507390EA97D1AC3 ON representative (enterprise_id)');
        $this->addSql('ALTER TABLE
          address
        ADD
          CONSTRAINT FK_D4E6F81A97D1AC3 FOREIGN KEY (enterprise_id) REFERENCES enterprise (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          investment
        ADD
          CONSTRAINT FK_43CA0AD6A97D1AC3 FOREIGN KEY (enterprise_id) REFERENCES enterprise (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          representative
        ADD
          CONSTRAINT FK_2507390EA97D1AC3 FOREIGN KEY (enterprise_id) REFERENCES enterprise (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE address_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE enterprise_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE investment_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE representative_id_seq CASCADE');
        $this->addSql('ALTER TABLE address DROP CONSTRAINT FK_D4E6F81A97D1AC3');
        $this->addSql('ALTER TABLE investment DROP CONSTRAINT FK_43CA0AD6A97D1AC3');
        $this->addSql('ALTER TABLE representative DROP CONSTRAINT FK_2507390EA97D1AC3');
        $this->addSql('DROP TABLE address');
        $this->addSql('DROP TABLE enterprise');
        $this->addSql('DROP TABLE investment');
        $this->addSql('DROP TABLE representative');
    }
}
