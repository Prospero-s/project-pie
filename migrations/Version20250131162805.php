<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250131162805 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE group_role_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE group_role (
          id INT NOT NULL,
          user_group_id INT NOT NULL,
          user_id INT NOT NULL,
          role VARCHAR(50) NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_7E33D11A1ED93D47 ON group_role (user_group_id)');
        $this->addSql('CREATE INDEX IDX_7E33D11AA76ED395 ON group_role (user_id)');
        $this->addSql('ALTER TABLE
          group_role
        ADD
          CONSTRAINT FK_7E33D11A1ED93D47 FOREIGN KEY (user_group_id) REFERENCES user_group (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          group_role
        ADD
          CONSTRAINT FK_7E33D11AA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE group_invitation ADD role VARCHAR(50) NOT NULL');
        $this->addSql('ALTER TABLE representative DROP cognito_id');
        $this->addSql('ALTER TABLE "user" ADD name VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE "user" DROP roles');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D6495E237E06 ON "user" (name)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE group_role_id_seq CASCADE');
        $this->addSql('ALTER TABLE group_role DROP CONSTRAINT FK_7E33D11A1ED93D47');
        $this->addSql('ALTER TABLE group_role DROP CONSTRAINT FK_7E33D11AA76ED395');
        $this->addSql('DROP TABLE group_role');
        $this->addSql('ALTER TABLE group_invitation DROP role');
        $this->addSql('DROP INDEX UNIQ_8D93D6495E237E06');
        $this->addSql('ALTER TABLE "user" ADD roles JSON NOT NULL');
        $this->addSql('ALTER TABLE "user" DROP name');
        $this->addSql('ALTER TABLE representative ADD cognito_id VARCHAR(255) DEFAULT NULL');
    }
}
