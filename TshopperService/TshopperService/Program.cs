using Microsoft.EntityFrameworkCore;
using TshopperService;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<ShoppingListDbContext>(options => options.UseSqlite("Data Source=shoppinglist.db"));
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();
app.MapHub<ShoppingListHub>("/shoppingListHub");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShoppingListDbContext>();
    db.Database.EnsureCreated();
}

app.Run();