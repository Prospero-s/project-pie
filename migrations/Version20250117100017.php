<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250117100017 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE address_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE investment_id_seq CASCADE');
        $this->addSql('CREATE SEQUENCE company_address_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE company_investment_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE company_address (id INT NOT NULL, enterprise_id INT NOT NULL, num_voie VARCHAR(10) DEFAULT NULL, type_voie VARCHAR(50) DEFAULT NULL, voie TEXT DEFAULT NULL, code_postal VARCHAR(5) DEFAULT NULL, commune TEXT DEFAULT NULL, pays VARCHAR(50) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2D1C7556A97D1AC3 ON company_address (enterprise_id)');
        $this->addSql('CREATE TABLE company_investment (id INT NOT NULL, enterprise_id INT NOT NULL, cognito_id VARCHAR(255) NOT NULL, funding_type VARCHAR(50) NOT NULL, amount BIGINT NOT NULL, currency VARCHAR(3) NOT NULL, invested_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FE44E340A97D1AC3 ON company_investment (enterprise_id)');
        $this->addSql('ALTER TABLE company_address ADD CONSTRAINT FK_2D1C7556A97D1AC3 FOREIGN KEY (enterprise_id) REFERENCES enterprise (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE company_investment ADD CONSTRAINT FK_FE44E340A97D1AC3 FOREIGN KEY (enterprise_id) REFERENCES enterprise (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE address DROP CONSTRAINT fk_d4e6f81a97d1ac3');
        $this->addSql('ALTER TABLE investment DROP CONSTRAINT fk_43ca0ad6a97d1ac3');
        $this->addSql('DROP TABLE address');
        $this->addSql('DROP TABLE investment');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE company_address_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE company_investment_id_seq CASCADE');
        $this->addSql('CREATE SEQUENCE address_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE investment_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE address (id INT NOT NULL, enterprise_id INT NOT NULL, num_voie VARCHAR(10) DEFAULT NULL, type_voie VARCHAR(50) DEFAULT NULL, voie TEXT DEFAULT NULL, code_postal VARCHAR(5) DEFAULT NULL, commune TEXT DEFAULT NULL, pays VARCHAR(50) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX uniq_d4e6f81a97d1ac3 ON address (enterprise_id)');
        $this->addSql('CREATE TABLE investment (id INT NOT NULL, enterprise_id INT NOT NULL, cognito_id VARCHAR(255) NOT NULL, funding_type VARCHAR(50) NOT NULL, amount BIGINT NOT NULL, currency VARCHAR(3) NOT NULL, invested_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX uniq_43ca0ad6a97d1ac3 ON investment (enterprise_id)');
        $this->addSql('ALTER TABLE address ADD CONSTRAINT fk_d4e6f81a97d1ac3 FOREIGN KEY (enterprise_id) REFERENCES enterprise (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE investment ADD CONSTRAINT fk_43ca0ad6a97d1ac3 FOREIGN KEY (enterprise_id) REFERENCES enterprise (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE company_address DROP CONSTRAINT FK_2D1C7556A97D1AC3');
        $this->addSql('ALTER TABLE company_investment DROP CONSTRAINT FK_FE44E340A97D1AC3');
        $this->addSql('DROP TABLE company_address');
        $this->addSql('DROP TABLE company_investment');
    }
}
