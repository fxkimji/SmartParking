using Microsoft.AspNetCore.Mvc;

namespace SmartParking.Server
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
