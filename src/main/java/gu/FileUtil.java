package gu;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.http.HttpServletResponse;

import org.springframework.web.multipart.MultipartFile;

public class FileUtil {

    public void makeBasePath(String path) {
        File dir = new File(path); 
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    public String saveFile(MultipartFile file, String basePath, String fileName){
        if (file == null || file.getName().equals("") || file.getSize() < 1) {
            return null;
        }
     
        makeBasePath(basePath);
        String serverFullPath = basePath + fileName;
  
        File file1 = new File(serverFullPath);
        try {
            file.transferTo(file1);
        } catch (IllegalStateException ex) {
            System.out.println("IllegalStateException: " + ex.toString());
        } catch (IOException ex) {
            System.out.println("IOException: " + ex.toString());
        }
        
        return serverFullPath;
    }
    
    public String getNewName() {
        SimpleDateFormat ft = new SimpleDateFormat("yyyyMMddhhmmssSSS");
        return ft.format(new Date()) + (int) (Math.random() * 10);
    }
    
    public String getFileExtension(String filename) {
          Integer mid = filename.lastIndexOf(".");
          return filename.substring(mid, filename.length());
    }

    public String getRealPath(String path, String filename) {
        return path + filename.substring(0,4) + "/";
    }
    
    public void fileDownload(HttpServletResponse response, String path, String filename) {
        String realPath = "";
        
        try {
            filename = URLEncoder.encode(filename, "UTF-8");
        } catch (UnsupportedEncodingException ex) {
            System.out.println("UnsupportedEncodingException");
        }
        
        realPath = path + filename;

        File file1 = new File(realPath);
        if (!file1.exists()) {
            return ;
        }
        
        response.setHeader("Content-Disposition", "attachment; filename=\""+filename+"\"");
        response.setContentType("application/octet-stream;");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Cache-Control", "no-cache, must-revalidate");
        response.setDateHeader("Expires", 0);
        
		try {
			OutputStream os = response.getOutputStream();
	        FileInputStream fis = new FileInputStream(realPath);
	
	        int ncount = 0;
	
	        byte[] bytes = new byte[512];
	
	        while((ncount = fis.read(bytes)) != -1 ) {
	            os.write(bytes, 0, ncount);
	        }
	
	        fis.close();
	        os.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
    }
}
