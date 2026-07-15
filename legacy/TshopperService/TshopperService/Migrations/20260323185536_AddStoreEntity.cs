using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TshopperService.Migrations
{
    /// <inheritdoc />
    public partial class AddStoreEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StoreId",
                table: "ShoppingItems",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Stores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Color = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stores", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShoppingItems_StoreId",
                table: "ShoppingItems",
                column: "StoreId");

            migrationBuilder.AddForeignKey(
                name: "FK_ShoppingItems_Stores_StoreId",
                table: "ShoppingItems",
                column: "StoreId",
                principalTable: "Stores",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShoppingItems_Stores_StoreId",
                table: "ShoppingItems");

            migrationBuilder.DropTable(
                name: "Stores");

            migrationBuilder.DropIndex(
                name: "IX_ShoppingItems_StoreId",
                table: "ShoppingItems");

            migrationBuilder.DropColumn(
                name: "StoreId",
                table: "ShoppingItems");
        }
    }
}
