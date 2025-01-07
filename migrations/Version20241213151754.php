<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241213151754 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE address (id SERIAL NOT NULL, head_office BOOLEAN NOT NULL, contry VARCHAR(100) NOT NULL, postal_code VARCHAR(10) NOT NULL, city VARCHAR(100) NOT NULL, track_type VARCHAR(50) NOT NULL, route VARCHAR(255) NOT NULL, lane_number INT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE contact (id SERIAL NOT NULL, phone VARCHAR(15) NOT NULL, mobile_phone VARCHAR(15) NOT NULL, pro_mail VARCHAR(255) NOT NULL, perso_mail VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE enterprise (id SERIAL NOT NULL, address_id_id INT NOT NULL, denomination VARCHAR(255) NOT NULL, remoe_society BOOLEAN NOT NULL, etablished_in_france BOOLEAN NOT NULL, legal_form VARCHAR(100) NOT NULL, main_activity VARCHAR(255) NOT NULL, siret BIGINT NOT NULL, siren BIGINT NOT NULL, code_naf VARCHAR(10) NOT NULL, activities TEXT NOT NULL, capital INT NOT NULL, min_capital INT NOT NULL, currency VARCHAR(10) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_B1B36A0348E1E977 ON enterprise (address_id_id)');
        $this->addSql('CREATE TABLE executive (id SERIAL NOT NULL, address_id INT NOT NULL, contact_id_id INT NOT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_E72A7AAF5B7AF75 ON executive (address_id)');
        $this->addSql('CREATE INDEX IDX_E72A7AA526E8E58 ON executive (contact_id_id)');
        $this->addSql('CREATE TABLE setting (id SERIAL NOT NULL, user_id_id INT NOT NULL, notif_pref VARCHAR(100) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_9F74B8989D86650F ON setting (user_id_id)');
        $this->addSql('CREATE TABLE type_society (id SERIAL NOT NULL, enterprise_id_id INT NOT NULL, type VARCHAR(100) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_25450E076B311ADA ON type_society (enterprise_id_id)');
        $this->addSql('CREATE TABLE "user" (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, create_date TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('ALTER TABLE enterprise ADD CONSTRAINT FK_B1B36A0348E1E977 FOREIGN KEY (address_id_id) REFERENCES address (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE executive ADD CONSTRAINT FK_E72A7AAF5B7AF75 FOREIGN KEY (address_id) REFERENCES address (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE executive ADD CONSTRAINT FK_E72A7AA526E8E58 FOREIGN KEY (contact_id_id) REFERENCES contact (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE setting ADD CONSTRAINT FK_9F74B8989D86650F FOREIGN KEY (user_id_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE type_society ADD CONSTRAINT FK_25450E076B311ADA FOREIGN KEY (enterprise_id_id) REFERENCES enterprise (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE enterprise DROP CONSTRAINT FK_B1B36A0348E1E977');
        $this->addSql('ALTER TABLE executive DROP CONSTRAINT FK_E72A7AAF5B7AF75');
        $this->addSql('ALTER TABLE executive DROP CONSTRAINT FK_E72A7AA526E8E58');
        $this->addSql('ALTER TABLE setting DROP CONSTRAINT FK_9F74B8989D86650F');
        $this->addSql('ALTER TABLE type_society DROP CONSTRAINT FK_25450E076B311ADA');
        $this->addSql('DROP TABLE address');
        $this->addSql('DROP TABLE contact');
        $this->addSql('DROP TABLE enterprise');
        $this->addSql('DROP TABLE executive');
        $this->addSql('DROP TABLE setting');
        $this->addSql('DROP TABLE type_society');
        $this->addSql('DROP TABLE "user"');
    }
}
