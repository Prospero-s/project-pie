<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250324173410 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE company_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE company_address_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE company_investment_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE group_invitation_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE group_role_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE kpi_data_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE representative_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE upload_document_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE "user_id_seq" INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE user_group_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE company (
          id INT NOT NULL,
          siren VARCHAR(9) NOT NULL,
          denomination TEXT NOT NULL,
          business_structures TEXT DEFAULT NULL,
          code_ape TEXT DEFAULT NULL,
          siret VARCHAR(14) DEFAULT NULL,
          sector TEXT DEFAULT NULL,
          updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
          created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          deleted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_4FBF094FDB8BBA08 ON company (siren)');
        $this->addSql('COMMENT ON COLUMN company.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN company.deleted_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE company_address (
          id INT NOT NULL,
          company_id INT NOT NULL,
          street_number VARCHAR(10) DEFAULT NULL,
          street_types VARCHAR(50) DEFAULT NULL,
          voie TEXT DEFAULT NULL,
          code_postal VARCHAR(5) DEFAULT NULL,
          commune TEXT DEFAULT NULL,
          pays VARCHAR(50) NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2D1C7556979B1AD6 ON company_address (company_id)');
        $this->addSql('CREATE TABLE company_investment (
          id INT NOT NULL,
          company_id INT NOT NULL,
          user_id INT NOT NULL,
          user_group_id INT NOT NULL,
          funding_type VARCHAR(50) NOT NULL,
          amount BIGINT NOT NULL,
          currency VARCHAR(3) NOT NULL,
          invested_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_FE44E340979B1AD6 ON company_investment (company_id)');
        $this->addSql('CREATE INDEX IDX_FE44E340A76ED395 ON company_investment (user_id)');
        $this->addSql('CREATE INDEX IDX_FE44E3401ED93D47 ON company_investment (user_group_id)');
        $this->addSql('CREATE TABLE group_invitation (
          id INT NOT NULL,
          group_id INT NOT NULL,
          invited_by_id INT NOT NULL,
          email TEXT NOT NULL,
          token VARCHAR(36) NOT NULL,
          expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          role VARCHAR(50) NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_26D000105F37A13B ON group_invitation (token)');
        $this->addSql('CREATE INDEX IDX_26D00010FE54D947 ON group_invitation (group_id)');
        $this->addSql('CREATE INDEX IDX_26D00010A7B4A7E3 ON group_invitation (invited_by_id)');
        $this->addSql('CREATE TABLE group_role (
          id INT NOT NULL,
          user_group_id INT NOT NULL,
          user_id INT NOT NULL,
          role VARCHAR(50) NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_7E33D11A1ED93D47 ON group_role (user_group_id)');
        $this->addSql('CREATE INDEX IDX_7E33D11AA76ED395 ON group_role (user_id)');
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
        $this->addSql('CREATE INDEX IDX_1DC49958979B1AD6 ON kpi_data (company_id)');
        $this->addSql('COMMENT ON COLUMN kpi_data.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN kpi_data.deleted_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE representative (
          id INT NOT NULL,
          company_id INT DEFAULT NULL,
          nom VARCHAR(255) NOT NULL,
          qualite VARCHAR(255) NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_2507390E979B1AD6 ON representative (company_id)');
        $this->addSql('CREATE TABLE upload_document (
          id INT NOT NULL,
          user_id INT NOT NULL,
          kpi_data_id INT NOT NULL,
          uploaded_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_9F1E7213A76ED395 ON upload_document (user_id)');
        $this->addSql('CREATE INDEX IDX_9F1E721338648DDF ON upload_document (kpi_data_id)');
        $this->addSql('CREATE TABLE "user" (
          id INT NOT NULL,
          user_group_id INT DEFAULT NULL,
          cognito_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D64982CBE480 ON "user" (cognito_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D6495E237E06 ON "user" (name)');
        $this->addSql('CREATE INDEX IDX_8D93D6491ED93D47 ON "user" (user_group_id)');
        $this->addSql('CREATE TABLE user_group (
          id INT NOT NULL,
          owner_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_8F02BF9D7E3C61F9 ON user_group (owner_id)');
        $this->addSql('ALTER TABLE
          company_address
        ADD
          CONSTRAINT FK_2D1C7556979B1AD6 FOREIGN KEY (company_id) REFERENCES company (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          company_investment
        ADD
          CONSTRAINT FK_FE44E340979B1AD6 FOREIGN KEY (company_id) REFERENCES company (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          company_investment
        ADD
          CONSTRAINT FK_FE44E340A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          company_investment
        ADD
          CONSTRAINT FK_FE44E3401ED93D47 FOREIGN KEY (user_group_id) REFERENCES user_group (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          group_invitation
        ADD
          CONSTRAINT FK_26D00010FE54D947 FOREIGN KEY (group_id) REFERENCES user_group (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          group_invitation
        ADD
          CONSTRAINT FK_26D00010A7B4A7E3 FOREIGN KEY (invited_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          group_role
        ADD
          CONSTRAINT FK_7E33D11A1ED93D47 FOREIGN KEY (user_group_id) REFERENCES user_group (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          group_role
        ADD
          CONSTRAINT FK_7E33D11AA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          kpi_data
        ADD
          CONSTRAINT FK_1DC49958979B1AD6 FOREIGN KEY (company_id) REFERENCES company (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          representative
        ADD
          CONSTRAINT FK_2507390E979B1AD6 FOREIGN KEY (company_id) REFERENCES company (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          upload_document
        ADD
          CONSTRAINT FK_9F1E7213A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          upload_document
        ADD
          CONSTRAINT FK_9F1E721338648DDF FOREIGN KEY (kpi_data_id) REFERENCES kpi_data (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          "user"
        ADD
          CONSTRAINT FK_8D93D6491ED93D47 FOREIGN KEY (user_group_id) REFERENCES user_group (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          user_group
        ADD
          CONSTRAINT FK_8F02BF9D7E3C61F9 FOREIGN KEY (owner_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE company_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE company_address_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE company_investment_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE group_invitation_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE group_role_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE kpi_data_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE representative_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE upload_document_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE "user_id_seq" CASCADE');
        $this->addSql('DROP SEQUENCE user_group_id_seq CASCADE');
        $this->addSql('ALTER TABLE company_address DROP CONSTRAINT FK_2D1C7556979B1AD6');
        $this->addSql('ALTER TABLE company_investment DROP CONSTRAINT FK_FE44E340979B1AD6');
        $this->addSql('ALTER TABLE company_investment DROP CONSTRAINT FK_FE44E340A76ED395');
        $this->addSql('ALTER TABLE company_investment DROP CONSTRAINT FK_FE44E3401ED93D47');
        $this->addSql('ALTER TABLE group_invitation DROP CONSTRAINT FK_26D00010FE54D947');
        $this->addSql('ALTER TABLE group_invitation DROP CONSTRAINT FK_26D00010A7B4A7E3');
        $this->addSql('ALTER TABLE group_role DROP CONSTRAINT FK_7E33D11A1ED93D47');
        $this->addSql('ALTER TABLE group_role DROP CONSTRAINT FK_7E33D11AA76ED395');
        $this->addSql('ALTER TABLE kpi_data DROP CONSTRAINT FK_1DC49958979B1AD6');
        $this->addSql('ALTER TABLE representative DROP CONSTRAINT FK_2507390E979B1AD6');
        $this->addSql('ALTER TABLE upload_document DROP CONSTRAINT FK_9F1E7213A76ED395');
        $this->addSql('ALTER TABLE upload_document DROP CONSTRAINT FK_9F1E721338648DDF');
        $this->addSql('ALTER TABLE "user" DROP CONSTRAINT FK_8D93D6491ED93D47');
        $this->addSql('ALTER TABLE user_group DROP CONSTRAINT FK_8F02BF9D7E3C61F9');
        $this->addSql('DROP TABLE company');
        $this->addSql('DROP TABLE company_address');
        $this->addSql('DROP TABLE company_investment');
        $this->addSql('DROP TABLE group_invitation');
        $this->addSql('DROP TABLE group_role');
        $this->addSql('DROP TABLE kpi_data');
        $this->addSql('DROP TABLE representative');
        $this->addSql('DROP TABLE upload_document');
        $this->addSql('DROP TABLE "user"');
        $this->addSql('DROP TABLE user_group');
    }
}
