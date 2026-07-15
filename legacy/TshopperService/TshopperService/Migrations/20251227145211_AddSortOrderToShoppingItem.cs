using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TshopperService.Migrations
{
    /// <inheritdoc />
    public partial class AddSortOrderToShoppingItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "ShoppingItems",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "ShoppingItems");
        }
    }
}
