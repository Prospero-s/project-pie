<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250205215438 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE company_investment ADD user_group_id INT NOT NULL');
        $this->addSql('ALTER TABLE
          company_investment
        ADD
          CONSTRAINT FK_FE44E3401ED93D47 FOREIGN KEY (user_group_id) REFERENCES user_group (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_FE44E3401ED93D47 ON company_investment (user_group_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE company_investment DROP CONSTRAINT FK_FE44E3401ED93D47');
        $this->addSql('DROP INDEX IDX_FE44E3401ED93D47');
        $this->addSql('ALTER TABLE company_investment DROP user_group_id');
    }
}
