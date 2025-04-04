<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250317175958 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE verification_code_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE verification_code (
          id INT NOT NULL,
          email VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          code VARCHAR(6) NOT NULL,
          created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          is_used BOOLEAN NOT NULL,
          type VARCHAR(255) NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('COMMENT ON COLUMN verification_code.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN verification_code.expires_at IS \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE verification_code_id_seq CASCADE');
        $this->addSql('DROP TABLE verification_code');
    }
}
