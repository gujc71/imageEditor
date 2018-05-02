package gu;

import java.io.DataOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartFile;

import sun.misc.BASE64Decoder;
import gu.FileUtil;

@Controller
public class ImageEditor{
    private String filePath = "d:\\"; 

	@RequestMapping(value = "imageEditor")
	public String imageEditor() {
		
		return "imageEditor"; 
	}	

	@RequestMapping(value = "fileUpload")
	public void fileUpload(HttpServletResponse response, MultipartFile upfile) {
        if(upfile==null) return;
        
		try {
			FileUtil fu = new FileUtil();
			String filename = fu.getNewName();
			fu.saveFile(upfile, filePath, filename );
			response.getWriter().print(filename);
		} catch (Exception ex) {
			System.out.println("File Upload Error");
		}
	}
	
    @RequestMapping(value = "fileDownload")
    public void fileDownload(HttpServletResponse response, String filename) {
        FileUtil fu = new FileUtil();
        fu.fileDownload(response, filePath, filename );
    }
    
	@RequestMapping(value = "saveImage", method = RequestMethod.POST)
	public void saveImage(HttpServletRequest request, MultipartFile imageFile) {
		String filename = filePath +"/"+ request.getParameter("fileori");
		
		try {
			byte[] Filebyte = imageFile.getBytes();
			imageFile.getInputStream().read(Filebyte);
		
		    String encString = new String(Filebyte, "ASCII");
			encString = encString.replace("data:image/png;base64,", "");
			
			FileOutputStream fs = new FileOutputStream(filename);
			DataOutputStream ds = new DataOutputStream(fs);
			
			BASE64Decoder decoder = new BASE64Decoder();
			byte[] data = decoder.decodeBuffer(encString);
		
			for (byte dataB : data) {                                 
				ds.writeByte(dataB);                         
			}                 
			ds.close();
			fs.close();
		} catch (IOException e) {
			System.out.println("IOException Error");                 
		}
	}
}
